'use client';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { tokenList } from '@/app/_libs/utils/constants/TokenList';
import SwapInput from './SwapInput';
import Icon from '../UI/icon';
import ModalTokensList from './ModalTokensList';
import SwapButton from './SwapButton';
import RatioInput from './RatioInput';
import CustomRatioChoices from './CustomRatioChoices';
import SwapLimitExpiry from './SwapLimitExpiry';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import { useAccount } from 'wagmi';
import {
  networkData,
  NetworkName,
} from '@/app/_libs/utils/constants/swapConstants';

interface Token {
  id: string;
  ticker: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
}
type CustomRatio = {
  title: string;
  value: number;
};
type Expiry = {
  title: string;
  value: number;
};

const LimitTab = () => {
  const [tokenOne, setTokenOne] = useState<Token | null>(null);
  const [tokenTwo, setTokenTwo] = useState<Token | null>(null);
  const [tokenOneSymbol, setTokenOneSymbol] = useState<string>('WETH');
  const [tokenTwoSymbol, setTokenTwoSymbol] = useState<string>('USDC');
  const [network, setNetwork] = useState<NetworkName>('mainnet');
  const [tokenOneAmount, setTokenOneAmount] = useState<number | string>('');
  const [tokenTwoAmount, setTokenTwoAmount] = useState<number | string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [prices, setPrices] = useState<{
    tokenOne?: string;
    tokenTwo?: string;
  }>({});
  const [customRatio, setCustomRatio] = useState<number | string>('');
  const [selectedRatio, setSelectedRatio] = useState<CustomRatio | null>(null);
  const [expiry, setExpiry] = useState<Expiry>({ title: '1 Week', value: 7 });
  const { address, chainId } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const [warningMessage, setWarningMessage] = useState('');
  const [isSwapButtonDisable, setIsSwapButtonDisable] =
    useState<boolean>(false);

  const fetchPrices = async () => {
    // try {
    //   const [TokenOneRes, TokenTwoRes] = await Promise.all([
    //     fetch(`https://api.coincap.io/v2/assets/${tokenOne.id}`),
    //     fetch(`https://api.coincap.io/v2/assets/${tokenTwo.id}`),
    //   ]);
    //   const dataOne = await TokenOneRes.json();
    //   const tokenOnePrice = parseFloat(dataOne.data.priceUsd).toFixed(4);
    //   const dataTwo = await TokenTwoRes.json();
    //   const tokenTwoPrice = parseFloat(dataTwo.data.priceUsd).toFixed(4);
    //   if (parseFloat(tokenTwoPrice) !== 0) {
    //     const usdPrices = {
    //       tokenOne: tokenOnePrice,
    //       tokenTwo: tokenTwoPrice,
    //     };
    //     setCustomRatio(parseFloat(tokenOnePrice) / parseFloat(tokenTwoPrice));
    //     setPrices(usdPrices);
    //   } else {
    //     console.warn('TokenTwo price is zero, skipping ratio calculation');
    //   }
    // } catch (error) {
    //   console.error('Error fetching token prices:', error);
    // }
  };

  useEffect(() => {
    // fetchPrices();
  }, [tokenOne, tokenTwo]);

  useEffect(() => {
    if (
      tokenOneAmount !== '' &&
      prices.tokenOne &&
      customRatio !== undefined &&
      parseFloat(String(customRatio)) !== 0
    ) {
      const amountNumber = parseFloat(String(tokenOneAmount));
      setTokenTwoAmount(
        (amountNumber * parseFloat(String(customRatio))).toFixed(6).toString()
      );
    } else {
      setTokenTwoAmount('');
    }
  }, [tokenOneAmount, prices, tokenOne, customRatio]);

  const onChangeTokenInput = (e: ChangeEvent<HTMLInputElement>) => {
    let amount = e.target.value;
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

  const changeRatioInput = (e: ChangeEvent<HTMLInputElement>) => {
    let ratio = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (ratio === '' || re.test(ratio)) {
      setCustomRatio(ratio);
    }
  };

  const changeRatio = (ratio: CustomRatio) => {
    setCustomRatio((prevRatio) => parseFloat(String(prevRatio)) * ratio.value);
    setSelectedRatio(ratio);
  };

  const changeExpiry = (expiry: Expiry) => {
    setExpiry(expiry);
  };
  const approveAndSwap = async () => {
    if (!provider || !signer || !address || !tokenOne || !tokenTwo) {
      console.error('Provider or signer is not available');
      return;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-16">
        {/* <RatioInput
          tokenOne={tokenOne}
          tokenTwo={tokenTwo}
          tokensRatio={customRatio}
          onChange={changeRatioInput}
        /> */}
        <CustomRatioChoices
          selectedRatio={selectedRatio}
          changeRatio={changeRatio}
        />
      </div>

      <SwapInput
        tokenSymbol={tokenOneSymbol}
        network={network}
        tokenWraptitle="You pay"
        tokenAmount={tokenOneAmount}
        clearAction={clearTokenInput}
        onChange={onChangeTokenInput}
        disable={false}
        changeToken={() => changeSwapToken(1)}
        tokenPrice={0}
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
        tokenPrice={0}
      />
      <ModalTokensList
        isOpen={isOpen}
        network={network}
        modifyToken={modifyToken}
        closeModal={() => setIsOpen(false)}
      />
      <div className="mt-16">
        <p className="text-white">Expiry</p>
        <SwapLimitExpiry expiry={expiry} changeExpiry={changeExpiry} />
      </div>

      <SwapButton
        executeSwap={approveAndSwap}
        isDisable={isSwapButtonDisable}
        warningMessage={warningMessage}
      />
    </div>
  );
};

export default LimitTab;
