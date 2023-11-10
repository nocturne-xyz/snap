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

const displayAmount = (amount: string | number): string => {
  if (typeof amount === "string") amount = parseFloat(amount);
  if (amount >= 1) return amount.toFixed(2);
  if (amount >= 0.01) return amount.toFixed(4);
  return parseFloat(amount.toFixed(5)).toString(); // Removes trailing zeros
};

const makeFinalContent = (
  items: { heading: string; messages: string[] }[]
): Panel => {
  const formattedItems = items.flatMap((item, i) => {
    return [
      ...(i > 0 ? [divider()] : []),
      heading(item.heading),
      ...item.messages.map((m) => {
        const safeText = m.replace(NEWLINE_AND_CARRIAGE_RETURN_REGEX, ""); // Strip newlines and carriage returns to avoid injected malicious formatting
        return text(safeText);
      })
    ];
  });
  return panel(formattedItems);
};

export const makeSignCanonAddrRegistryEntryContent = (
  entry: CanonAddrRegistryEntry
): Panel => {
  const heading = "Confirm signature to register canonical address";
  const messages = [
    `Registering your canonical address gives your Ethereum account an address with which you
      receive private payments.`,
    `Your connected Ethereum address: **${entry.ethAddress}**`
  ];

  return makeFinalContent([{ heading, messages }]);
};

export const makeSignOperationContent = (
  opMetadata: OperationMetadata,
  erc20s: Map<string, Erc20Config>,
  gasAssetContractAddr: Address,
  fee: bigint
): Panel => {
  const headItem = {
    heading: "Confirm transaction from your Nocturne account".replace(
      NEWLINE_AND_CARRIAGE_RETURN_REGEX,
      ""
    ),
    messages: []
  };

  const actionItems = opMetadata.items.map((item) => {
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
          erc20Address
        } = item;
        const ticker = lookupTickerByAddress(erc20Address, erc20s);
        const displayAmount = formatUnits(amountSmallestUnits);

        heading = "ERC-20 Transfer";
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
        heading = "ETH Transfer";
        messages.push(
          `Action: Send **${displayAmountEth} ETH**`,
          `Recipient Address: ${recipientAddress}`
        );
        break;
      }
      case "UniswapV3 Swap": {
        const {
          tokenIn,
          inAmount: amountSmallestUnits,
          tokenOut,
          maxSlippageBps,
          exactQuoteWei,
          minimumAmountOutWei
        } = item;
        const tickerIn = lookupTickerByAddress(tokenIn, erc20s);
        const tickerOut = lookupTickerByAddress(tokenOut, erc20s);
        const displayAmountIn = displayAmount(formatUnits(amountSmallestUnits));
        const displayExactQuote = displayAmount(formatUnits(exactQuoteWei));
        const displayMinimumAmountOut = displayAmount(
          formatUnits(minimumAmountOutWei)
        );
        const displaySlippage = displayAmount(maxSlippageBps / 100);
        heading = "Token swap";

        if (tickerIn && tickerOut) {
          messages.push(
            `Action: Swap **${displayAmountIn} ${tickerIn}** for ≈**${displayExactQuote} ${tickerOut}**`
          );
        } else {
          messages.push(
            "Action: Swap",
            `From token: **${tickerIn ?? displayUnrecognizedAsset(tokenIn)}**`,
            `Amount: **${displayAmountIn}**`,
            `To token: **${tickerOut ?? displayUnrecognizedAsset(tokenOut)}**`,
            `Amount: ~**${displayExactQuote}**`
          );
        }
        messages.push(
          `Max slippage: ${displaySlippage}%`,
          `Minimum amount out: ${displayMinimumAmountOut} ${
            tickerOut ?? displayUnrecognizedAsset(tokenOut)
          }`
        );
        break;
      }
      default:
        throw new Error(`Operation type ${item.actionType} not yet supported!`);
    }

    return {
      heading,
      messages: messages.map(
        (m) => m.replace(NEWLINE_AND_CARRIAGE_RETURN_REGEX, "") // Strip newlines and carriage returns
      )
    };
  });

  const gasItemHeader = "Gas Compensation";
  const gasItemMessages = [];
  const gasAssetTicker = lookupTickerByAddress(gasAssetContractAddr, erc20s);
  if (!gasAssetTicker) {
    gasItemMessages.push(
      `Gas Fee: **${formatUnits(
        fee
      )} of unrecognized token (${gasAssetContractAddr})**`
    );
  } else {
    const decimals = erc20s.get(gasAssetTicker)!.precision;
    gasItemMessages.push(
      `Gas Fee: **${formatUnits(fee, decimals)} ${gasAssetTicker}**`
    );
  }

  gasItemMessages.push(
    "Note: This fee is an estimate. Any excess will be refunded back to your Nocturne account."
  );

  const gasItem = {
    heading: gasItemHeader,
    messages: gasItemMessages.map((m) =>
      m.replace(NEWLINE_AND_CARRIAGE_RETURN_REGEX, "")
    )
  };

  return makeFinalContent([headItem, ...actionItems, gasItem]);
};
