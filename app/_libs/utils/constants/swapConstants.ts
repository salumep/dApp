import { Token, ChainId } from '@uniswap/sdk-core';

interface NetworkDetails {
  V3_SWAP_ROUTER_ADDRESS: string;
  QUOTER_CONTRACT_ADDRESS: string;
  tokens: {
    tokenA: Token;
    tokenB: Token;
  };
}
export type NetworkName = 'mainnet' | 'sepolia';

interface NetworkData {
  mainnet: NetworkDetails;
  sepolia: NetworkDetails;
  MAX_FEE_PER_GAS: string;
  MAX_PRIORITY_FEE_PER_GAS: string;
}
export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984';
export const QuoterV2 = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  ticker: string;
  img: string;
}

// Define the tokenList structure
interface TokenList {
  [network: string]: {
    [symbol: string]: TokenInfo;
  };
}

export const tokenList: TokenList = {
  mainnet: {
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      ticker: 'WETH',
      img: 'https://cdn.moralis.io/eth/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.png',
    },
    USDC: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      symbol: 'USDC',
      name: 'USD//C',
      ticker: 'USDC',
      img: 'https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    // Add more tokens as needed
  },
  sepolia: {
    WETH: {
      address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      ticker: 'WETH',
      img: 'https://cdn.moralis.io/eth/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.png',
    },
    USDC: {
      address: '0xf08A50178dfcDe18524640EA6618a1f965821715',
      decimals: 6,
      symbol: 'USDC',
      name: 'USD//C',
      ticker: 'USDC',
      img: 'https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    // Add more tokens as needed
  },
};
export const networkData = {
  mainnet: {
    V3_SWAP_ROUTER_ADDRESS: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    QUOTER_CONTRACT_ADDRESS: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  },
  sepolia: {
    V3_SWAP_ROUTER_ADDRESS: '0x946E9C780F3c79D80e51e68d259d0D7E794F2124',
    QUOTER_CONTRACT_ADDRESS: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
  },
  MAX_FEE_PER_GAS: '100000000000',
  MAX_PRIORITY_FEE_PER_GAS: '100000000000',
};
export const ERC20_ABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address _spender, uint256 _value) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
];
