import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import OrderbookABI from '@/app/_libs/utils/abis/Orderbook.json';
import TransactionInfo from './TransactionInfo';
import { ORDERBOOK_ADDRESS } from '@/app/_libs/utils/constants/contractAddresses';
import { useTokenContext } from '@/app/_context/TokenContext';
import Icon from '../UI/icon';
import { toast } from 'react-toastify';
interface Props {
  marginType: number;
  leverage: number;
  actionType: 'buy' | 'sell';
}

const MarketOrder: React.FC<Props> = ({ marginType, leverage, actionType }) => {
  const [amount, setAmount] = useState<string>('0.00');
  const [isUSDC, setIsUSDC] = useState<boolean>(false);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { selectedToken, tokenPrice } = useTokenContext();

  // Initialize contract instance
  const contract = new ethers.Contract(
    ORDERBOOK_ADDRESS,
    OrderbookABI,
    signer || provider
  );

  // Function to handle toggle between token and USDC
  const toggleAmountMode = () => {
    setIsUSDC((prev) => !prev);
  };

  // Function to handle the amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (amount === '' || re.test(amount)) {
      setAmount(amount);
    }
  };

  const convertUSDCToTokenAmount = async (
    usdcAmount: string
  ): Promise<string> => {
    if (tokenPrice) {
      const usdcAmountNumber = parseFloat(usdcAmount);

      if (isNaN(usdcAmountNumber)) {
        throw new Error('Invalid USDC amount');
      }

      // Calculate the token amount based on the current price from context
      const tokenAmount = usdcAmountNumber / tokenPrice;
      return tokenAmount.toFixed(6); // Adjust the precision as needed
    } else {
      throw new Error('Token price data is not available');
    }
  };

  const submitMarketOrder = async () => {
    let parsedAmount: ethers.BigNumber;

    if (isUSDC) {
      // Convert USDC to token amount before parsing
      const tokenAmount = await convertUSDCToTokenAmount(amount);
      parsedAmount = ethers.utils.parseUnits(
        tokenAmount.toString(),
        selectedToken.decimals
      );
    } else {
      // Directly parse the token amount
      parsedAmount = ethers.utils.parseUnits(
        amount.toString(),
        selectedToken.decimals
      );
    }

    const isBuyOrder = actionType == 'buy' ? true : false;
    const asset = selectedToken.address;

    try {
      const tx = await contract.placeMarketOrder(
        asset,
        parsedAmount,
        isBuyOrder,
        leverage,
        marginType
      );

      await tx.wait();
      toast.success('Market order placed successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-neutral-light"
        >
          {isUSDC ? 'Amount (USDC)' : `Amount (${selectedToken.ticker})`}
        </label>
        <div className="relative">
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="mt-1 block w-full pl-6 pr-4 py-3 rounded-2xl text-neutral-light shadow-sm bg-white-bg-05 sm:text-sm"
            placeholder={`${isUSDC ? '0.00' : '0'}`}
          />
          {isUSDC && (
            <div className="absolute left-2 top-2.5 flex items-center">
              <span className="text-neutral-light font-light">$</span>
            </div>
          )}
          <div className="absolute right-2 top-2 flex items-center">
            <span className="text-neutral-light italic font-extralight mr-4">
              {isUSDC ? 'USDC' : selectedToken.ticker}
            </span>
            <button
              className="bg-primary-25 p-2 rounded-full"
              onClick={toggleAmountMode}
            >
              <Icon name="exchange" />
            </button>
          </div>
        </div>
      </div>
      <TransactionInfo submitOrder={submitMarketOrder} />
    </div>
  );
};

export default MarketOrder;
