import { ChainId, Token } from '@uniswap/sdk-core';
import { tokenList, NetworkName } from '../constants/swapConstants';

// Define the network to ChainId mapping
const networkToChainId: Record<NetworkName, ChainId> = {
  mainnet: ChainId.MAINNET,
  sepolia: ChainId.SEPOLIA,
};

export const createToken = (
  network: NetworkName,
  tokenSymbol: keyof (typeof tokenList)[NetworkName]
): Token => {
  const info = tokenList[network][tokenSymbol];

  if (!info) {
    throw new Error(`Token ${tokenSymbol} not found for network ${network}`);
  }

  return new Token(
    networkToChainId[network],
    info.address,
    info.decimals,
    info.symbol,
    info.name
  );
};
