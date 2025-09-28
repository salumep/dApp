import React, { useState } from 'react';
import Modal from 'react-modal';

interface Props {
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (state: boolean) => void;
}

const WithdrawModal: React.FC<Props> = ({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
}) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAmount(e.target.value);

  const handleWithdraw = () => {
    // Implement withdraw functionality
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
      width: '600px',
      background: 'unset',
      border: 'none',
      overflowY: 'hidden',
    },
    overlay: {
      background: '#00000066',
      overflow: 'auto',
      zIndex: '20',
    },
  };

  return (
    <Modal
      isOpen={isWithdrawModalOpen}
      onRequestClose={() => setIsWithdrawModalOpen(false)}
      style={customStyles}
    >
      <div className="w-full h-full overflow-y-auto p-8 bg-white bg-opacity-20 rounded-2xl backdrop-blur-lg flex flex-col gap-10">
        {/* Header */}
        <div className="w-full flex flex-col gap-3">
          <div className="text-white text-xl font-light italic">Withdraw</div>
          <p className="text-gray-400 text-lg italic">
            USDC withdrawals to{' '}
            <span className="text-teal-500 underline font-medium">
              select chains
            </span>{' '}
            have the lowest fees. Other withdrawal methods (e.g., assets on
            Ethereum) may have higher third-party fees.
          </p>
        </div>

        {/* Input Fields */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex gap-4">
            {/* Address Input */}
            <div className="bg-white bg-opacity-5 rounded-xl p-4 flex flex-col gap-1 grow">
              <label className="text-gray-400italic">Destination</label>
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                placeholder="Address"
                className="text-white  italic bg-transparent border-none outline-none"
              />
            </div>
            {/* Source */}
            <div className="bg-white bg-opacity-5 rounded-xl p-4 flex items-center gap-2 grow">
              <img
                src="https://etherscan.io/images/svg/brands/ethereum-original.svg"
                alt="Source"
                className="w-9 h-9"
              />
              <span className="text-white  italic">Ethereum</span>
            </div>
          </div>

          {/* Asset Info */}
          <div className="bg-white bg-opacity-5 rounded-xl p-4 flex items-center gap-2">
            <img
              src="https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
              alt="Asset"
              className="w-9 h-9"
            />
            <div className="flex items-center gap-2">
              <span className="text-white l italic">USD Coin</span>
              <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                USDC
              </span>
            </div>
          </div>
        </div>

        {/* Amount and Details */}
        <div className="w-full flex flex-col gap-3">
          {/* Amount Input */}
          <div className="bg-white bg-opacity-5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-gray-400  italic">Amount</span>
            <div className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
              MAX
            </div>
          </div>

          {/* Free Collateral */}
          <div className="flex justify-between items-center text-gray-400 ">
            <span>Free Collateral</span>
            <span className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
              USDC
            </span>
          </div>
        </div>

        {/* Expected Amount & Details */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-white bg-opacity-5 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center text-gray-400 ">
              <span>Expected Amount Received</span>
              <div className="px-3 py-1.5 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                USDC
              </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 ">
              <span>Max Slippage</span>
              <span className="text-white  font-medium">0.00%</span>
            </div>
            <div className="flex justify-between items-center text-gray-400 ">
              <span>Estimated Time</span>
              <span className="text-white  font-medium">&lt; 30 minutes</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Account Leverage</span>
              <span>-</span>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            className="px-3 py-4 bg-primary-15 w-full text-xl rounded-2xl shadow bg-opacity-50 text-white text-sm font-[Inter] italic"
          >
            Withdraw Funds
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawModal;
