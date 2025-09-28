'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import SwapInput from './SwapInput';
import ModalTokensList from './ModalTokensList';
import SwapButton from './SwapButton';
import Icon from '../UI/icon';
import { ChainId, Token } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import { useAccount, useBalance } from 'wagmi';
import {
  networkData,
  NetworkName,
} from '@/app/_libs/utils/constants/swapConstants';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import fromReadableAmount from '@/app/_libs/utils/swap/fromReadableAmount';
import {
  getTokenTransferApproval,
  TransactionState,
} from '@/app/_libs/utils/swap/getTokenTransferApproval';
import executeSwap from '@/app/_libs/utils/swap/executeSwap';
import { createToken } from '@/app/_libs/utils/swap/createToken';

// Helper function to safely parse a string to a number
const parseAmount = (amount: string | number): number => {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const parsed = parseFloat(amountStr);
  return isNaN(parsed) ? 0 : parsed;
};

const SwapTab = () => {
  const [tokenOneSymbol, setTokenOneSymbol] = useState<string>('WETH');
  const [tokenTwoSymbol, setTokenTwoSymbol] = useState<string>('USDC');
  const [network, setNetwork] = useState<NetworkName>('mainnet');
  const [tokenOne, setTokenOne] = useState<Token | null>(null);
  const [tokenTwo, setTokenTwo] = useState<Token | null>(null);
  const [tokenOneAmount, setTokenOneAmount] = useState<string>('0');
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [prices, setPrices] = useState<any>({});
  const { address, chainId } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const [warningMessage, setWarningMessage] = useState('');

  const [tokenOneBalance, setTokenOneBalance] = useState<string>('0');
  const [isSwapButtonDisable, setIsSwapButtonDisable] =
    useState<boolean>(false);

  useEffect(() => {
    setNetwork(chainId === ChainId.MAINNET ? 'mainnet' : 'sepolia');
  }, [chainId]);

  useEffect(() => {
    setTokenOne(createToken(network, tokenOneSymbol));
    setTokenTwo(createToken(network, tokenTwoSymbol));
  }, [network, tokenOneSymbol, tokenTwoSymbol]);

  const data = networkData[network];

  const { data: tokenBalance } = useBalance({
    address: address,
    token: tokenOne?.address as `0x${string}`,
  });

  useEffect(() => {
    if (tokenBalance) {
      const formattedBalance = tokenBalance?.formatted || '0';
      setTokenOneBalance(formattedBalance);
    }
  }, [tokenBalance]);

  const setMaxAsAmount = () => {
    setTokenOneAmount(tokenOneBalance);
  };

  useEffect(() => {
    fetchPrices();
  }, [tokenOne, tokenTwo]);

  useEffect(() => {
    if (tokenOneAmount !== '' && prices?.ratio) {
      const amountNumber = parseAmount(tokenOneAmount);
      setTokenTwoAmount(
        (amountNumber * parseAmount(prices.ratio)).toFixed(6).toString()
      );
    } else {
      setTokenTwoAmount('');
    }
    const isDisabled =
      parseAmount(tokenOneAmount) <= 0 ||
      parseAmount(tokenOneAmount) > parseAmount(tokenOneBalance);

    setIsSwapButtonDisable(isDisabled);

    if (isDisabled) {
      if (parseAmount(tokenOneAmount) <= 0) {
        setWarningMessage('Amount must be greater than 0.');
      } else if (parseAmount(tokenOneAmount) > parseAmount(tokenOneBalance)) {
        setWarningMessage('Insufficient balance.');
      } else {
        setWarningMessage('Swap button is disabled.');
      }
    } else {
      setWarningMessage(''); // Clear the alert message if swap is enabled
    }
  }, [tokenOneAmount, prices, tokenOne]);

  const fetchPrices = async () => {
    if (!provider || !tokenOne || !tokenTwo) return;

    const quoterContract = new ethers.Contract(
      data.QUOTER_CONTRACT_ADDRESS,
      Quoter.abi,
      provider
    );

    try {
      const amountIn = fromReadableAmount(1, tokenOne?.decimals); // 1 token in smallest unit

      const quoteTokenOneToTwo =
        await quoterContract.callStatic.quoteExactInputSingle(
          tokenOne.address,
          tokenTwo.address,
          FeeAmount.MEDIUM, // Fee tier
          amountIn.toString(),
          0
        );

      const tokenOneToTwoPrice = parseFloat(
        ethers.utils.formatUnits(quoteTokenOneToTwo, tokenTwo.decimals)
      );

      const isTokenOneUSDC = tokenOne.symbol === 'USDC';
      const isTokenTwoUSDC = tokenTwo.symbol === 'USDC';

      const tokenTwoToOnePrice = 1 / tokenOneToTwoPrice;

      setPrices({
        tokenOne: isTokenOneUSDC ? 1 : tokenOneToTwoPrice.toFixed(4),
        tokenTwo: isTokenTwoUSDC ? 1 : tokenTwoToOnePrice.toFixed(4),
        ratio: tokenOneToTwoPrice.toFixed(4),
      });
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  };

  const onChangeTokenInput = (e: ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (amount === '' || re.test(amount)) {
      setTokenOneAmount(amount);
    }
  };

  const changeSwapToken = (assetNumber: number) => {
    setIsOpen(true);
    setChangeToken(assetNumber);
  };

  const modifyToken = (symbol: string) => {
    clearTokenInput();
    if (changeToken === 1) {
      setTokenOneSymbol(symbol);
    } else {
      setTokenTwoSymbol(symbol);
    }
    setIsOpen(false);
  };

  const switchTokens = () => {
    clearTokenInput();
    const tempToken = tokenOne;
    setTokenOne(tokenTwo);
    setTokenTwo(tempToken);
  };

  const clearTokenInput = () => {
    setTokenOneAmount('');
    setTokenTwoAmount('');
  };

  const approveAndSwap = async () => {
    if (!provider || !signer || !address || !tokenOne || !tokenTwo) {
      console.error('Provider or signer is not available');
      return;
    }

    const tokenOneAmountNumber = parseAmount(tokenOneAmount);

    // Request approval
    const approvalStatusTokenOne = await getTokenTransferApproval(
      tokenOne,
      tokenOneAmountNumber,
      provider,
      data.V3_SWAP_ROUTER_ADDRESS,
      signer,
      address
    );

    if (approvalStatusTokenOne === TransactionState.Success) {
      // Proceed with swapping only if the approval is successful
      await executeSwap(
        provider,
        signer,
        address,
        tokenOne,
        tokenTwo,
        tokenOneAmountNumber,
        data.V3_SWAP_ROUTER_ADDRESS
      );
    } else {
      console.error('Token approval failed');
    }
  };

  return (
    <div className="p-8">
      <SwapInput
        tokenSymbol={tokenOneSymbol}
        network={network}
        tokenWraptitle="You pay"
        tokenAmount={tokenOneAmount}
        clearAction={clearTokenInput}
        onChange={onChangeTokenInput}
        disable={false}
        changeToken={() => changeSwapToken(1)}
        tokenPrice={prices.tokenOne}
        balance={tokenOneBalance}
        maxAction={setMaxAsAmount}
      />
      <div className="switchTokens flex justify-center" onClick={switchTokens}>
        <div className="border border-neutral-light p-2 rounded-full -mt-2">
          <Icon name="switchToken" />
        </div>
      </div>
      <SwapInput
        tokenSymbol={tokenTwoSymbol}
        network={network}
        tokenWraptitle="You receive"
        tokenAmount={tokenTwoAmount}
        clearAction={clearTokenInput}
        disable={true}
        changeToken={() => changeSwapToken(2)}
        tokenPrice={prices.tokenTwo}
      />
      <ModalTokensList
        isOpen={isOpen}
        network={network}
        modifyToken={modifyToken}
        closeModal={() => setIsOpen(false)}
      />
      <SwapButton
        executeSwap={approveAndSwap}
        isDisable={isSwapButtonDisable}
        warningMessage={warningMessage}
      />
    </div>
  );
};

export default SwapTab;
