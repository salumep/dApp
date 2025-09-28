import React from 'react';
import { useState, useEffect } from 'react';
import TimeInfForce from './TimeInForce';
import Time from './Time';
import TransactionInfo from './TransactionInfo';
import { ethers } from 'ethers';
import OrderbookABI from '@/app/_libs/utils/abis/Orderbook.json';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import { useWatchContractEvent } from 'wagmi';
import ProfitAndStop from './ProfitAndStop';
import { ORDERBOOK_ADDRESS } from '@/app/_libs/utils/constants/contractAddresses';
import { useTokenContext } from '@/app/_context/TokenContext';
import Icon from '../UI/icon';
import { toast } from 'react-toastify';

interface Props {
  marginType: number;
  leverage: number;
  actionType: 'buy' | 'sell';
}

const LimitOrder: React.FC<Props> = ({ marginType, leverage, actionType }) => {
  const [amount, setAmount] = useState<string>('5');
  const { selectedToken, tokenPrice } = useTokenContext();
  const [limitPrice, setLimitPrice] = useState<string>(
    `${tokenPrice?.toFixed(2)}`
  );
  const [hasTime, setHasTime] = useState<boolean>(true);
  const [isUSDC, setIsUSDC] = useState<boolean>(false);
  const [expirationTime, setExpirationTime] = useState<number>(
    Math.floor(Date.now() / 1000) + 5
  );
  const [time, setTime] = useState<{ type: string; amount: number }>({
    type: 'Days',
    amount: 28,
  });
  const [profit, setProfit] = useState<string>('0');
  const [stopLoss, setStopLoss] = useState<string>('0');

  useEffect(() => {
    if (hasTime) {
      let timeInSeconds = 0;
      switch (time.type) {
        case 'Days':
          timeInSeconds = time.amount * 24 * 60 * 60;
          break;
        case 'Hours':
          timeInSeconds = time.amount * 60 * 60;
          break;
        case 'Mins':
          timeInSeconds = time.amount * 60;
          break;
        case 'Weeks':
          timeInSeconds = time.amount * 7 * 24 * 60 * 60;
          break;
        default:
          timeInSeconds = 5;
      }
      setExpirationTime(Math.floor(Date.now() / 1000) + timeInSeconds);
    }
  }, [time, hasTime]);

  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const contract = new ethers.Contract(
    ORDERBOOK_ADDRESS,
    OrderbookABI,
    signer || provider
  );

  useWatchContractEvent({
    address: ORDERBOOK_ADDRESS,
    abi: OrderbookABI,
    eventName: 'OrderPlaced',
    onLogs(logs) {
      console.log('New logs!', logs);
    },
  });
  // Function to handle toggle between token and USDC
  const toggleAmountMode = () => {
    setIsUSDC((prev) => !prev);
  };
  const setMarketPrice = () => {
    setLimitPrice(`${tokenPrice?.toFixed(2)}`);
  };
  // Function to handle the amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (amount === '' || re.test(amount)) {
      setAmount(amount);
    }
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (amount === '' || re.test(amount)) {
      setLimitPrice(amount);
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
  const submitLimitOrder = async () => {
    const price = ethers.utils.parseUnits(limitPrice, selectedToken.decimals);
    let parsedAmount: ethers.BigNumber;
    // Convert stopLoss and profit to the token's decimal precision
    const stopLossPrice = ethers.utils.parseUnits(
      stopLoss,
      selectedToken.decimals
    );
    const takeProfitPrice = ethers.utils.parseUnits(
      profit,
      selectedToken.decimals
    );
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

    const gasLimit = ethers.utils.hexlify(1000000);
    const isBuyOrder = actionType === 'buy';
    const asset = selectedToken.address;

    try {
      const tx = await contract.placeLimitOrder(
        asset,
        price,
        takeProfitPrice,
        stopLossPrice,
        parsedAmount,
        isBuyOrder,
        expirationTime,
        leverage,
        marginType
      );

      await tx.wait();
      toast.success('Limit order placed successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <label
          htmlFor="limitPrice"
          className="block text-sm text-neutral-light font-medium "
        >
          Limit Price
        </label>

        <div className="relative">
          <input
            id="limitPrice"
            type="text"
            placeholder="$0.0"
            value={limitPrice}
            onChange={handlePriceChange}
            className="mt-1 block w-full  px-4 py-3  rounded-2xl  text-neutral-light bg-white-bg-05 sm:text-sm"
          />
          <button
            className="absolute top-2 right-2 text-white text-sm bg-primary-25 px-2 py-1 rounded-full"
            onClick={setMarketPrice}
          >
            mid
          </button>
        </div>
      </div>
      <div>
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

      <div className="mt-6  ">
        <div className="text-white mb-4">Advanced</div>

        <div className="flex items-center gap-4 justify-between ">
          <div className="grow">
            <TimeInfForce setHasTime={setHasTime} hasTime={hasTime} />
          </div>
          {hasTime && (
            <div className="grow">
              <Time setTime={setTime} />
            </div>
          )}
        </div>
        <div className="mt-4 text-center ">
          <ProfitAndStop
            profit={profit}
            setProfit={setProfit}
            stopLoss={stopLoss}
            setStopLoss={setStopLoss}
          />
        </div>

        <div className="transactionInfo">
          <TransactionInfo submitOrder={submitLimitOrder} />
        </div>
      </div>
    </div>
  );
};
export default LimitOrder;
