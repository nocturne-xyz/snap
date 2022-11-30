import {
  NocturneContext,
  NocturnePrivKey,
  NocturneSigner,
  IncludedNoteStruct,
  LocalMerkleProver,
  LocalNotesManager,
  MockSpend2Prover,
  operationRequestFromJSON,
  toJSON,
} from "@nocturne-xyz/sdk";
import { ethers } from "ethers";
import { OnRpcRequestHandler } from "@metamask/snap-types";
import { SnapDB } from "./snapdb";

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const db = new SnapDB();
  const nocturnePrivKey = new NocturnePrivKey(1n);
  const signer = new NocturneSigner(nocturnePrivKey);
  const nocturneAddr = signer.address;
  // Old note input to spend
  const oldNote: IncludedNoteStruct = {
    owner: nocturneAddr.toStruct(),
    nonce: 1n,
    asset: "0aaaa",
    value: 100n,
    id: 5n,
    merkleIndex: 0,
  };

  const notesManager = new LocalNotesManager(
    db,
    signer,
    "0xe9F3F81A41B4a777658661d85a74e21576d92E53",
    new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
  );
  const context = new NocturneContext(
    signer,
    new MockSpend2Prover(),
    await LocalMerkleProver.fromDb(
      "0xe9F3F81A41B4a777658661d85a74e21576d92E53",
      new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/"),
      db
    ),
    notesManager,
    db
  );

  console.log("Switching on method: ", request.method);
  switch (request.method) {
    case "hello":
      return wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: getMessage(origin),
            description:
              "This custom confirmation is just for display purposes.",
            textAreaContent:
              "But you can edit the snap source code to make it do something, if you want to!",
          },
        ],
      });
    case "setAndShowKv":
      await context.db.storeNote(oldNote);
      return wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: getMessage(origin),
            description: `Displaying newly set storage for ${{
              address: oldNote.asset,
              id: oldNote.id,
            }}`,
            textAreaContent: (
              await db.getNotesFor({
                address: oldNote.asset,
                id: oldNote.id,
              })
            )[0].asset,
          },
        ],
      });
    case "nocturne_syncNotes":
      await context.syncNotes();
      console.log(
        "Synced notes, state: ",
        JSON.stringify(await db.getSerializableState())
      );
      return;
    case "nocturne_syncLeaves":
      await context.syncLeaves();
      console.log(
        "Synced leaves, state: ",
        JSON.stringify(await db.getSerializableState())
      );
      return;
    case "nocturne_generateProof":
      console.log("Request params: ", request.params);
      const operationRequest = operationRequestFromJSON(
        request.params.operationRequest
      );
      const preProofOperationInputs =
        await context.tryGetPreProofSpendTxInputsAndProofInputs(
          operationRequest
        );
      console.log(
        "PreProofOperationInputsAndProofInputs: ",
        toJSON(preProofOperationInputs)
      );
      return toJSON(preProofOperationInputs);
    case "nocturne_clearDb":
      await context.db.clear();
      console.log(
        "Cleared DB, state: ",
        JSON.stringify(await db.getSerializableState())
      );
      return;
    default:
      throw new Error("Method not found.");
  }
};
