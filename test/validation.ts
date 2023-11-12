import { assert as chaiAssert } from "chai";
import { it } from "mocha";
import { assert } from "superstruct";
import {
  SetSpendKeyParams,
  SignCanonAddrRegistryEntryParams,
  SignOperationParams,
} from "../src/validation";

it("validates SetSpendKeyParams", () => {
  const goodData = {
    spendKey:
      "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };
  assert(goodData, SetSpendKeyParams);

  // wrong field name
  let badData: any = {
    spendKEY: goodData.spendKey,
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };

  // no 0x
  badData = {
    spendKey:
      "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };
  chaiAssert.throws(() => assert(badData, SetSpendKeyParams));

  // odd length
  badData = {
    spendKey:
      "0x123456789abcdef0123456789abcdef012345678abcdef0123456789abcdef0",
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };
  chaiAssert.throws(() => assert(badData, SetSpendKeyParams));

  // wrong even length
  badData = {
    spendKey:
      "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde",
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };

  // not hex
  badData = {
    spendKey:
      "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefg",
    eoaAddress: "0x9dD6B628336ECA9a57e534Fb25F1960fA11038f4",
  };
  chaiAssert.throws(() => assert(badData, SetSpendKeyParams));

  // number
  badData = { spendKey: 1234 };
  chaiAssert.throws(() => assert(badData, SetSpendKeyParams));

  // object
  badData = { spendKey: goodData };
  chaiAssert.throws(() => assert(badData, SetSpendKeyParams));
});

it("validates SignCanonAddrRegistryEntryParams", () => {
  const data = {
    entry: {
      ethAddress: "0x1234",
      compressedCanonAddr: 1234n,
      perCanonAddrNonce: 1234n,
    },
    chainId: 1234n,
    registryAddress: "0x1234",
  };
  const badData = {
    entry: {
      ethAddress: "0x1234",
      compressedCanonAddr: "not a bigint",
      perCanonAddrNonce: 1234n,
    },
    chainId: 1234n,
    registryAddress: "0x1234",
  };

  assert(data, SignCanonAddrRegistryEntryParams);
  chaiAssert.throws(() => assert(badData, SignCanonAddrRegistryEntryParams));
});

it("validates SignOperationParams", () => {
  const data = {
    op: {
      networkInfo: {
        chainId: 1234n,
        tellerContract: "0x1234",
      },
      refundAddr: {
        h1: 1234n,
        h2: 1234n,
      },
      refunds: [
        {
          encodedAsset: {
            encodedAssetAddr: 1234n,
            encodedAssetId: 1234n,
          },
          minRefundValue: 1234n,
        },
      ],
      actions: [
        {
          contractAddress: "0x1234",
          encodedFunction: "0x1234",
        },
      ],
      encodedGasAsset: {
        encodedAssetAddr: 1234n,
        encodedAssetId: 1234n,
      },
      gasAssetRefundThreshold: 1234n,
      executionGasLimit: 1234n,
      gasPrice: 1234n,
      deadline: 1234n,
      atomicActions: true,
      joinSplits: [
        {
          commitmentTreeRoot: 1234n,
          nullifierA: 1234n,
          nullifierB: 1234n,
          newNoteACommitment: 1234n,
          newNoteBCommitment: 1234n,
          senderCommitment: 1234n,
          joinSplitInfoCommitment: 1234n,
          encodedAsset: {
            encodedAssetAddr: 1234n,
            encodedAssetId: 1234n,
          },
          publicSpend: 1234n,
          newNoteAEncrypted: {
            ciphertextBytes: [1234],
            encapsulatedSecretBytes: [1234],
          },
          newNoteBEncrypted: {
            ciphertextBytes: [1234],
            encapsulatedSecretBytes: [1234],
          },
          receiver: {
            x: 1234n,
            y: 1234n,
          },
          oldNoteA: {
            owner: {
              h1X: 1234n,
              h1Y: 1234n,
              h2X: 1234n,
              h2Y: 1234n,
            },
            nonce: 1234n,
            asset: {
              assetType: 0,
              assetAddr: "0x1234",
              id: 1234n,
            },
            value: 1234n,
            merkleIndex: 1234,
          },
          oldNoteB: {
            owner: {
              h1X: 1234n,
              h1Y: 1234n,
              h2X: 1234n,
              h2Y: 1234n,
            },
            nonce: 1234n,
            asset: {
              assetType: 0,
              assetAddr: "0x1234",
              id: 1234n,
            },
            value: 1234n,
            merkleIndex: 1234,
          },
          newNoteA: {
            owner: {
              h1X: 1234n,
              h1Y: 1234n,
              h2X: 1234n,
              h2Y: 1234n,
            },
            nonce: 1234n,
            asset: {
              assetType: 0,
              assetAddr: "0x1234",
              id: 1234n,
            },
            value: 1234n,
          },
          newNoteB: {
            owner: {
              h1X: 1234n,
              h1Y: 1234n,
              h2X: 1234n,
              h2Y: 1234n,
            },
            nonce: 1234n,
            asset: {
              assetType: 0,
              assetAddr: "0x1234",
              id: 1234n,
            },
            value: 1234n,
          },
          merkleProofA: {
            path: [1234n],
            siblings: [[1234n]],
          },
          merkleProofB: {
            path: [1234n],
            siblings: [[1234n]],
          },
          refundAddr: {
            h1: 1234n,
            h2: 1234n,
          },
        },
      ],
      gasFeeEstimate: 1n,
    },
    metadata: {
      items: [
        {
          type: "Action",
          actionType: "UniswapV3 Swap",
          tokenIn: "0x1234",
          inAmount: 1234n,
          tokenOut: "0x5678",
          maxSlippageBps: 50,
          exactQuoteWei: 1234n,
          minimumAmountOutWei: 1234n,
        },
      ],
    },
  };
  const badData = {
    op: {
      networkInfo: {
        chainId: 1234n,
        tellerContract: "0x1234",
      },
      refundAddr: {
        h1: 1234n,
        h2: 1234n,
      },
      refunds: [
        {
          encodedAsset: {
            encodedAssetAddr: 1234n,
            encodedAssetId: 1234n,
          },
          minRefundValue: 1234n,
        },
      ],
      actions: [
        {
          contractAddress: "0x1234",
          encodedFunction: "0x1234",
        },
      ],
      encodedGasAsset: {
        encodedAssetAddr: 1234n,
        encodedAssetId: 1234n,
      },
      gasAssetRefundThreshold: 1234n,
      executionGasLimit: 1234n,
      gasPrice: 1234n,
      deadline: 1234n,
      atomicActions: true,
      // Missing joinsplits
    },
    metadata: {
      items: [
        {
          type: "Action",
          actionType: "UNDEFINED", // not a valid action
          tokenIn: "0x1234",
        },
      ],
    },
  };

  assert(data, SignOperationParams);
  chaiAssert.throws(() => assert(badData, SignOperationParams));
});
