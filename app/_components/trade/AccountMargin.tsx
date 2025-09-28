'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider, useEthersSigner } from '@/app/_libs/utils/ethers';
import OrderbookABI from '@/app/_libs/utils/abis/Orderbook.json';
import DepositeModal from './DepositeModal';
import WithdrawModal from './WithdrawModal';
import { ORDERBOOK_ADDRESS } from '@/app/_libs/utils/constants/contractAddresses';

const AccountMargin: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [marginType, setMarginType] = useState<number>(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const handleDeposit = async () => {
    try {
      const contract = new ethers.Contract(
        ORDERBOOK_ADDRESS,
        OrderbookABI,
        signer || provider
      );

      const parsedAmount = ethers.utils.parseUnits(amount.toString(), 6);

      console.log(`Parsed Amount: ${parsedAmount.toString()}`);
      console.log(`Margin Type: ${marginType}`);

      const tx = await contract.depositMargin(parsedAmount, marginType);
      console.log(`Transaction Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log('Transaction Receipt:', receipt);

      if (receipt.status === 1) {
        console.log('Transaction Successful');
      } else {
        console.error('Transaction Failed');
      }
    } catch (error) {
      console.error('Error in depositMargin:', error);
    } finally {
      setIsDepositModalOpen(false);
    }
  };

  const handleWithdraw = async () => {};

  return (
    <div className="bg-green-linear-gradient-180">
      <div className="flex items-center justify-between p-6">
        <div className="text-white mr-4 flex">
          <div className="px-4 py-2 bg-white-bg-05 text-white rounded-xl shadow-sm text-sm mr-4">
            chart
          </div>
          <div className="px-4 py-2 bg-white-bg-05 text-white rounded-xl shadow-sm text-sm ">
            LE chart
          </div>
        </div>
        <div>
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="px-4 py-2  bg-white-bg-05 text-white rounded-xl shadow-sm  text-sm mr-2"
          >
            Deposit
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-4 py-2 bg-white-bg-05 text-white rounded-xl shadow-sm text-sm "
          >
            Withdraw
          </button>
        </div>
      </div>
      <DepositeModal
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
      />
      {/* Withdraw Modal */}
      <WithdrawModal
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
      />
    </div>
  );
};

export default AccountMargin;
