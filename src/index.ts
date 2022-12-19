import {
  NocturneContext,
  NocturnePrivKey,
  NocturneSigner,
  IncludedNote,
  LocalMerkleProver,
  LocalNotesManager,
  MockJoinSplitProver,
  NocturneAddressTrait,
  OperationRequest,
} from "@nocturne-xyz/sdk";
import { ethers } from "ethers";
import { OnRpcRequestHandler } from "@metamask/snap-types";
import { SnapDB } from "./snapdb";
import * as JSON from "bigint-json-serialization";

const LOCAL_HOST_URL = "http://127.0.0.1:8545/";
const WALLET_ADDRESS = "0xFf3eeb78248f4E3E3715aeF132771Cd8DD6120Af";

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
  const oldNote: IncludedNote = {
    owner: nocturneAddr,
    nonce: 1n,
    asset: "0aaaa",
    value: 100n,
    id: 5n,
    merkleIndex: 0,
  };

  const notesManager = new LocalNotesManager(
    db,
    signer,
    WALLET_ADDRESS,
    new ethers.providers.JsonRpcProvider(LOCAL_HOST_URL)
  );
  const context = new NocturneContext(
    signer,
    new MockJoinSplitProver(),
    await LocalMerkleProver.fromDb(
      WALLET_ADDRESS,
      new ethers.providers.JsonRpcProvider(LOCAL_HOST_URL),
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
    case "nocturne_getRandomizedAddr":
      return JSON.stringify(
        NocturneAddressTrait.randomize(context.signer.address)
      );
    case "nocturne_getAllBalances":
      return JSON.stringify(await context.getAllAssetBalances());
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
    case "nocturne_getJoinSplitInputs":
      console.log("Request params: ", request.params);
      const operationRequest = JSON.parse(
        request.params.operationRequest
      ) as OperationRequest;

      // Ensure user has minimum balance for request
      await context.ensureMinimumForOperationRequest(operationRequest);

      // Confirm spend sig auth
      await wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: `Confirm Spend Authorization`,
            description: `${origin}`,
            textAreaContent: JSON.stringify(operationRequest.joinSplitRequests),
          },
        ],
      });

      const preProofOperationInputs = await context.tryGetPreProofOperation(
        operationRequest
      );
      console.log(
        "PreProofOperationInputsAndProofInputs: ",
        JSON.stringify(preProofOperationInputs)
      );
      return JSON.stringify(preProofOperationInputs);
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
