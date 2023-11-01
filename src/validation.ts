import {
  string,
  bigint,
  number,
  array,
  boolean,
  enums,
  union,
  define,
  object,
  optional,
} from "superstruct";

export const UndefinedType = define(
  "Undefined",
  (value) => value === undefined
);

const isDataHexString32 = (value: any) =>
  typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);

const DataHexString32Type = define(`DataHexString32Type`, isDataHexString32);

export const SetSpendKeyParams = object({
  spendKey: DataHexString32Type,
  eoaAddress: string(),
});

export const SignCanonAddrRegistryEntryParams = object({
  entry: object({
    ethAddress: string(),
    compressedCanonAddr: bigint(),
    perCanonAddrNonce: bigint(),
  }),
  chainId: bigint(),
  registryAddress: string(),
});

const NetworkInfoType = object({
  chainId: bigint(),
  tellerContract: string(),
});

const SteathAddressType = object({
  h1X: bigint(),
  h1Y: bigint(),
  h2X: bigint(),
  h2Y: bigint(),
});

const CompressedStealthAddressType = object({
  h1: bigint(),
  h2: bigint(),
});

const EncodedAssetType = object({
  encodedAssetAddr: bigint(),
  encodedAssetId: bigint(),
});

const TrackedAssetType = object({
  encodedAsset: EncodedAssetType,
  minRefundValue: bigint(),
});

const ActionType = object({
  contractAddress: string(),
  encodedFunction: string(),
});

const CanonAddressType = object({
  x: bigint(),
  y: bigint(),
});

const AssetTypeType = enums([0, 1, 2]);

const AssetType = object({
  assetType: AssetTypeType,
  assetAddr: string(),
  id: bigint(),
});

const EncryptedNoteType = object({
  ciphertextBytes: array(number()),
  encapsulatedSecretBytes: array(number()),
});

const NoteType = object({
  owner: SteathAddressType,
  sender: optional(CanonAddressType),
  nonce: bigint(),
  asset: AssetType,
  value: bigint(),
});

const IncludedNoteType = object({
  owner: SteathAddressType,
  sender: optional(CanonAddressType),
  nonce: bigint(),
  asset: AssetType,
  value: bigint(),
  merkleIndex: number(),
});

const MerkleProofInputType = object({
  path: array(bigint()),
  siblings: array(array(bigint())),
});

const PreSignJoinSplitType = object({
  commitmentTreeRoot: bigint(),
  nullifierA: bigint(),
  nullifierB: bigint(),
  newNoteACommitment: bigint(),
  newNoteBCommitment: bigint(),
  senderCommitment: bigint(),
  joinSplitInfoCommitment: bigint(),
  encodedAsset: EncodedAssetType,
  publicSpend: bigint(),
  newNoteAEncrypted: EncryptedNoteType,
  newNoteBEncrypted: EncryptedNoteType,
  receiver: CanonAddressType,
  oldNoteA: IncludedNoteType,
  oldNoteB: IncludedNoteType,
  newNoteA: NoteType,
  newNoteB: NoteType,
  merkleProofA: MerkleProofInputType,
  merkleProofB: MerkleProofInputType,
  refundAddr: CompressedStealthAddressType,
});

const PreSignOperationType = object({
  networkInfo: NetworkInfoType,
  refundAddr: CompressedStealthAddressType,
  refunds: array(TrackedAssetType),
  actions: array(ActionType),
  encodedGasAsset: EncodedAssetType,
  gasAssetRefundThreshold: bigint(),
  executionGasLimit: bigint(),
  gasPrice: bigint(),
  deadline: bigint(),
  atomicActions: boolean(),
  joinSplits: array(PreSignJoinSplitType),
});

const ConfidentialPaymentMetadataType = object({
  type: enums(["ConfidentialPayment"]),
  recipient: CanonAddressType,
  asset: AssetType,
  amount: bigint(),
});

const TransferActionMetadataType = object({
  type: enums(["Action"]),
  actionType: enums(["Transfer"]),
  recipientAddress: string(),
  erc20Address: string(),
  amount: bigint(),
});

const WethToWstethActionMetadataType = object({
  type: enums(["Action"]),
  actionType: enums(["Weth To Wsteth"]),
  amount: bigint(),
});

const TransferETHActionMetadataType = object({
  type: enums(["Action"]),
  actionType: enums(["Transfer ETH"]),
  recipientAddress: string(),
  amount: bigint(),
});

const UniswapV3SwapActionMetadataType = object({
  type: enums(["Action"]),
  actionType: enums(["UniswapV3 Swap"]),
  tokenIn: string(),
  inAmount: bigint(),
  tokenOut: string(),
});

const ActionMetadataType = union([
  TransferActionMetadataType,
  WethToWstethActionMetadataType,
  TransferETHActionMetadataType,
  UniswapV3SwapActionMetadataType,
]);

const OperationMetadataItemType = union([
  ConfidentialPaymentMetadataType,
  ActionMetadataType,
]);

const OperationMetadataType = object({
  items: array(OperationMetadataItemType),
});

export const SignOperationParams = object({
  op: PreSignOperationType,
  metadata: OperationMetadataType,
});
