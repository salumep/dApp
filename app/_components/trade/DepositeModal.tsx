import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useBalance, useAccount } from 'wagmi';
import { ORDERBOOK_ADDRESS } from '@/app/_libs/utils/constants/contractAddresses';
import OrderbookABI from '@/app/_libs/utils/abis/Orderbook.json';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import TokenABI from '@/app/_libs/utils/abis/Token.json';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

interface props {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (state: boolean) => void;
}

const DepositeModal: React.FC<props> = ({
  isDepositModalOpen,
  setIsDepositModalOpen,
}) => {
  const { address } = useAccount();
  const [tokenOneBalance, setTokenOneBalance] = useState<string>('0');
  const tokenAddress = process.env
    .NEXT_PUBLIC_COLLATERAL_TOKEN as `0x${string}`;
  const [depositAmount, setDepositAmount] = useState('');
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  // get token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token: tokenAddress,
  });

  useEffect(() => {
    if (tokenBalance) {
      const formattedBalance = tokenBalance?.formatted || '0';
      setTokenOneBalance(formattedBalance);
    }
  }, [tokenBalance]);

  // handle percentage click *****************************
  const handlePercentageClick = (percentage: number) => {
    const amount = ((parseFloat(tokenOneBalance) * percentage) / 100).toFixed(
      0
    );
    setDepositAmount(amount);
  };

  // Function to handle the amount change ********************************
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    const re = /^[0-9]*\.?[0-9]*$/;

    if (amount === '' || re.test(amount)) {
      setDepositAmount(amount);
    }
  };

  const handleDeposit = async () => {
    if (!signer || !provider) {
      console.error('Signer or provider is missing.');
      return;
    }
    if (depositAmount === '' || depositAmount === '0') {
      toast.error(`Deposit amount should be more than zero`);
      return;
    }

    const decimals = 6; // Ensure the decimals match the token
    const amount = ethers.utils.parseUnits(depositAmount.toString(), decimals);

    try {
      const tokenContract = new ethers.Contract(tokenAddress, TokenABI, signer);

      // Check token balance before deposit
      const tokenBalanceBefore = await tokenContract.balanceOf(
        await signer.getAddress()
      );
      // console.log(
      //   'Token balance before deposit:',
      //   ethers.utils.formatUnits(tokenBalanceBefore, decimals)
      // );

      // Check allowance before deposit
      const allowance = await tokenContract.allowance(
        await signer.getAddress(),
        ORDERBOOK_ADDRESS
      );
      // console.log(
      //   'Allowance before deposit:',
      //   ethers.utils.formatUnits(allowance, decimals)
      // );

      // If allowance is less than the deposit amount, approve the required tokens
      if (allowance.lt(amount)) {
        console.log('Approving tokens for the OrderBook contract...');
        const approveTx = await tokenContract.approve(
          ORDERBOOK_ADDRESS,
          amount
        );
        await approveTx.wait();
        // console.log('Approval successful!');
        toast.success('Approval successful!');
      } else {
        console.log('Sufficient allowance already set.');
      }

      const orderBookContract = new ethers.Contract(
        ORDERBOOK_ADDRESS,
        OrderbookABI,
        signer
      );

      // Send the deposit transaction
      console.log('Sending deposit transaction...');
      const tx = await orderBookContract.deposit(amount);
      console.log('Deposit transaction hash:', tx.hash);

      await tx.wait(); // Wait for the transaction to be mined
      toast.success('Deposit confirmed!');
      console.log('Deposit confirmed!');

      // Check token balance after deposit
      const tokenBalanceAfter = await tokenContract.balanceOf(
        await signer.getAddress()
      );
      // console.log(
      //   'Token balance after deposit:',
      //   ethers.utils.formatUnits(tokenBalanceAfter, decimals)
      // );

      // // Check allowance after deposit
      // const newAllowance = await tokenContract.allowance(
      //   await signer.getAddress(),
      //   ORDERBOOK_ADDRESS
      // );
      // console.log(
      //   'Allowance after deposit:',
      //   ethers.utils.formatUnits(newAllowance, decimals)
      // );
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error(`Transaction failed: ${error.message}`);
    }
  };
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: 0,
      height: '650px',
      background: 'unset',
      border: 'none',
      overflowY: 'hidden',
      width: '600px',
    },
    overlay: {
      background: '#00000066',
      overflow: 'auto',
      zIndex: '20',
    },
  };

  return (
    <Modal
      isOpen={isDepositModalOpen}
      onRequestClose={() => setIsDepositModalOpen(false)}
      style={customStyles}
    >
      <div className="w-full h-full overflow-y-auto p-8 bg-white bg-opacity-20 rounded-2xl backdrop-blur-lg flex flex-col items-center gap-10">
        <div className="w-full h-[115px] flex flex-col gap-3">
          <div className="flex gap-3">
            <span className="text-white text-[26px] italic font-light leading-10">
              Deposit
            </span>
          </div>
          <p className="text-gray-400 text-sm italic font-light leading-[31.5px]">
            USDC deposits from{' '}
            <span className="text-teal-500 font-medium underline">
              select chains
            </span>{' '}
            have the lowest fees. Other deposits may have additional third-party
            fees.
          </p>
        </div>

        <div className="w-full h-[230px] flex flex-col gap-3">
          <div className="w-full px-8 py-4 bg-white bg-opacity-5 rounded-xl flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 text-sm italic font-light">
                Source
              </span>
              <div className="flex items-center gap-2">
                <img
                  className="w-[35px] h-[35px]"
                  src="https://etherscan.io/images/svg/brands/ethereum-original.svg"
                />
                <span className="text-white text-[20px] italic font-light">
                  Ethereum
                </span>
              </div>
            </div>
          </div>

          <div className="w-full px-8 py-4 bg-white bg-opacity-5 rounded-xl flex justify-between items-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 text-sm italic font-light">
                Asset
              </span>
              <div className="flex items-center gap-2">
                <img
                  className="w-[35px] h-[35px]"
                  src="https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
                />
                <span className="text-white text-[20px] italic font-light">
                  USD Coin
                </span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                  USDC
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <div className="w-full flex justify-between items-center">
            <span className="text-white italic font-light">Available</span>
            <span className="text-white italic font-light">
              {`${tokenOneBalance} USDC`}
            </span>
          </div>

          <div className="w-full px-4 py-4 bg-white bg-opacity-5 rounded-xl flex justify-center items-center gap-7">
            <input
              type="text"
              className="flex-1 text-lg text-white flex justify-between items-center bg-transparent"
              placeholder="$0.00"
              value={depositAmount}
              onChange={handleAmountChange}
            />
            <span className="text-right text-gray-400 text-lg italic font-[275]">
              USDC
            </span>
          </div>

          <div className="w-full flex gap-3">
            <button
              className="flex-1 px-4 py-1.5 bg-gradient-to-r from-teal-500 bg-opacity-25 rounded-full text-teal-500 font-[Inter] italic"
              onClick={() => handlePercentageClick(25)}
            >
              25%
            </button>
            <button
              className="flex-1 px-4 py-1.5 border border-gray-400 rounded-full text-gray-400 font-[Inter] italic"
              onClick={() => handlePercentageClick(50)}
            >
              50%
            </button>
            <button
              className="flex-1 px-4 py-1.5 border border-gray-400 rounded-full text-gray-400 font-[Inter] italic"
              onClick={() => handlePercentageClick(75)}
            >
              75%
            </button>
            <button
              className="flex-1 px-4 py-1.5 border border-gray-400 rounded-full text-gray-400 font-[Inter] italic"
              onClick={() => handlePercentageClick(100)}
            >
              MAX
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col items-end gap-3">
          <div className="w-full px-8 py-4 bg-white bg-opacity-5 rounded-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 italic font-light">
                  Expected Deposit Amount
                </span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic">
                  USDC
                </span>
              </div>
              <span className="text-gray-400 italic font-light">-</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 italic font-light">Equity</span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic">
                  USDC
                </span>
              </div>
              <span className="text-gray-400 italic font-light">-</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 italic font-light">Fees</span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic">
                  USDC
                </span>
              </div>
              <span className="text-gray-400 italic font-light">-</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 italic font-light">Rewards</span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic">
                  USDC
                </span>
              </div>
              <span className="text-gray-400 italic font-light">-</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 italic font-light">
                  Final Deposit Amount
                </span>
                <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic">
                  USDC
                </span>
              </div>
              <span className="text-gray-400 italic font-light">-</span>
            </div>
          </div>
          <button
            onClick={handleDeposit}
            className="px-3 py-4 bg-primary-15 w-full text-xl rounded-2xl shadow bg-opacity-50 text-white text-sm font-[Inter] italic"
          >
            Deposit Funds
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DepositeModal;
