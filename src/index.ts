import {
  NocturneContext,
  NocturnePrivKey,
  NocturneSigner,
  LocalMerkleProver,
  LocalNotesManager,
  MockJoinSplitProver,
  NocturneAddressTrait,
  OperationRequest,
  NotesDB,
  MerkleDB,
  SNARK_SCALAR_FIELD,
} from "@nocturne-xyz/sdk";
import { ethers } from "ethers";
import { getBIP44AddressKeyDeriver } from "@metamask/key-tree";
import { OnRpcRequestHandler } from "@metamask/snap-types";
import { SnapKvStore } from "./snapdb";
import * as JSON from "bigint-json-serialization";

const LOCAL_HOST_URL = "http://127.0.0.1:8545/";
const WALLET_ADDRESS = "0xE706317bf66b1C741CfCa5dCf5B78A44B5eD79e0";

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

export const NOCTURNE_BIP44_COINTYPE = 6789;

async function getNocturnePrivKeyFromBIP44(): Promise<NocturnePrivKey> {
  const nocturneNode = await wallet.request({
    method: "snap_getBip44Entropy",
    params: {
      coinType: NOCTURNE_BIP44_COINTYPE,
    },
  });
  const addressKeyDeriver = await getBIP44AddressKeyDeriver(nocturneNode);
  const keyNode = await addressKeyDeriver(0);
  const sk = BigInt(keyNode.privateKey) % SNARK_SCALAR_FIELD;
  const nocturnePrivKey = new NocturnePrivKey(sk);
  return nocturnePrivKey;
}

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
  const kvStore = new SnapKvStore();
  const notesDB = new NotesDB(kvStore);
  const merkleDB = new MerkleDB(kvStore);

  const nocturnePrivKey = await getNocturnePrivKeyFromBIP44();
  const signer = new NocturneSigner(nocturnePrivKey);

  const notesManager = new LocalNotesManager(
    notesDB,
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
      merkleDB
    ),
    notesManager,
    notesDB
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
        JSON.stringify(await kvStore.getState())
      );
      return;
    case "nocturne_syncLeaves":
      await context.syncLeaves();
      console.log(
        "Synced leaves, state: ",
        JSON.stringify(await kvStore.getState())
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
      await kvStore.clear();
      console.log(
        "Cleared DB, state: ",
        JSON.stringify(await kvStore.getState())
      );
      return;
    default:
      throw new Error("Method not found.");
  }
};
