// Utility function to validate Ethereum addresses
const isValidEthereumAddress = (
  address: string | undefined
): address is `0x${string}` => {
  return typeof address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(address);
};

// Fallback values for addresses
const fallbackOrderbookAddress: `0x${string}` =
  '0x0000000000000000000000000000000000000000';
const fallbackLiquidityPoolAddress: `0x${string}` =
  '0x0000000000000000000000000000000000000000';

// Export validated and type-safe environment variables
export const ORDERBOOK_ADDRESS: `0x${string}` = isValidEthereumAddress(
  process.env.NEXT_PUBLIC_ORDERBOOK_ADDRESS
)
  ? process.env.NEXT_PUBLIC_ORDERBOOK_ADDRESS
  : fallbackOrderbookAddress;

export const LIQUIDITY_POOL_ADDRESS: `0x${string}` = isValidEthereumAddress(
  process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS
)
  ? process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS
  : fallbackLiquidityPoolAddress;
