import { Panel, divider, heading, panel, text } from "@metamask/snaps-ui";
import { OperationMetadata } from "@nocturne-xyz/client";
import { Erc20Config } from "@nocturne-xyz/config";
import { Address, CanonAddrRegistryEntry } from "@nocturne-xyz/core";
import { formatUnits } from "ethers/lib/utils";

const NEWLINE_AND_CARRIAGE_RETURN_REGEX = /[\r\n]+/g;

const lookupTickerByAddress = (
  address: string,
  erc20s: Map<string, Erc20Config>
): string | undefined => {
  const addressToTicker = new Map<string, string>();
  erc20s.forEach((erc20Config, ticker) => {
    addressToTicker.set(
      erc20Config.address.toLowerCase(),
      ticker.toUpperCase()
    );
  });
  return addressToTicker.get(address.toLowerCase());
};

const makeFinalContent = (
  items: { heading: string; messages: string[] }[]
): Panel => {
  const formattedItems = items.flatMap((item) => {
    return [
      heading(item.heading),
      divider(),
      ...item.messages.map((m) => {
        const safeText = m.replace(NEWLINE_AND_CARRIAGE_RETURN_REGEX, ""); // Strip newlines and carriage returns to avoid injected malicious formatting
        return text(safeText);
      }),
    ];
  });
  return panel(formattedItems);
};

export const makeSignCanonAddrRegistryEntryContent = (
  entry: CanonAddrRegistryEntry
): Panel => {
  const heading = "Confirm signature to register canonical address";
  const messages = [
    `Registering your canonical address provisions your account with an address with which you
      receive private payments.`,
    `Your connected Ethereum address: **${entry.ethAddress}**`,
  ];

  return makeFinalContent([{ heading, messages }]);
};

export const makeSignOperationContent = (
  opMetadata: OperationMetadata,
  erc20s: Map<string, Erc20Config>
): Panel => {
  const items = opMetadata.items.map((item) => {
    if (item.type !== "Action")
      throw new Error(`${item.type} snap display not yet supported`);

    let heading: string;
    const messages: string[] = [];

    const displayUnrecognizedAsset = (asset: Address) =>
      `${asset} _(Unrecognized asset)_`;
    switch (item.actionType) {
      case "Transfer": {
        const {
          amount: amountSmallestUnits,
          recipientAddress,
          erc20Address,
        } = item;
        const ticker = lookupTickerByAddress(erc20Address, erc20s);
        const displayAmount = formatUnits(amountSmallestUnits);

        heading = "Confirm transfer from your Nocturne account";
        messages.push(
          "Action: Transfer",
          `Amount: **${displayAmount}**`,
          `Asset Token: **${
            ticker ?? displayUnrecognizedAsset(erc20Address)
          }**`,
          `Recipient Address: ${recipientAddress}`
        );
        break;
      }
      case "Transfer ETH": {
        const { recipientAddress, amount: amountSmallestUnits } = item;
        const displayAmountEth = formatUnits(amountSmallestUnits);
        heading = "Confirm transfer from your Nocturne account";
        messages.push(
          `Action: Send **${displayAmountEth} ETH**`,
          `Recipient Address: ${recipientAddress}`
        );
        break;
      }
      case "UniswapV3 Swap": {
        const { tokenIn, inAmount: amountSmallestUnits, tokenOut } = item;
        const tickerIn = lookupTickerByAddress(tokenIn, erc20s);
        const tickerOut = lookupTickerByAddress(tokenOut, erc20s);
        const displayAmountIn = formatUnits(amountSmallestUnits);
        heading = "Confirm token swap";

        if (tickerIn && tickerOut) {
          messages.push(
            `Action: Swap **${displayAmountIn} ${tickerIn}** for **${tickerOut}**`
          );
        } else {
          messages.push(
            "Action: Swap",
            `Amount: **${displayAmountIn}**`,
            `From token: **${tickerIn ?? displayUnrecognizedAsset(tokenIn)}**`,
            `To token: **${tickerOut ?? displayUnrecognizedAsset(tokenOut)}**`
          );
        }
        break;
      }
      default:
        throw new Error(`Operation type ${item.actionType} not yet supported!`);
    }

    return {
      heading,
      messages: messages.map(
        (m) => m.replace(NEWLINE_AND_CARRIAGE_RETURN_REGEX, "") // Strip newlines and carriage returns
      ),
    };
  });
  return makeFinalContent(items);
};
