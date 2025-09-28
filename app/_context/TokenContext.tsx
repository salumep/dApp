// context/TokenContext.tsx
'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Token } from '../_libs/types/token';
import { tokenList } from '../_libs/utils/constants/TokenList';
import { getLatestPrice } from '../_libs/utils/getLatestPrice';
import { ethers } from 'ethers';

interface TokenContextProps {
  selectedToken: Token;
  tokenPrice: number | null;
  setToken: (token: Token) => void;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}

export function TokenProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setToken] = useState<Token>(tokenList[0]);
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);

  const updateTokenPrice = async () => {
    if (!selectedToken.chainlinkFeedAddress) {
      return;
    }

    try {
      const roundData = await getLatestPrice(
        selectedToken.chainlinkFeedAddress
      );

      const price = Number(ethers.utils.formatUnits(roundData[1], 8));
      setTokenPrice(price);
    } catch (error) {
      console.error('Error fetching token price:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(updateTokenPrice, 10000); // 3 minutes
    updateTokenPrice(); // initial fetch

    return () => clearInterval(interval);
  }, [selectedToken]);

  return (
    <TokenContext.Provider value={{ selectedToken, setToken, tokenPrice }}>
      {children}
    </TokenContext.Provider>
  );
}
