import React from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import {
  NetworkName,
  tokenList,
} from '@/app/_libs/utils/constants/swapConstants';
import Icon from '../UI/icon';

interface Props {
  isOpen: boolean;
  modifyToken: (symbol: string) => void;
  closeModal: () => void;
  network: NetworkName;
}

const ModalTokensList: React.FC<Props> = ({
  isOpen,
  modifyToken,
  closeModal,
  network,
}) => {
  const customStyles: Modal.Styles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '0',
      width: '800px',
      height: '650px',
      background: '#3F4C49',
      border: 'none',
      overflowY: 'auto' as 'auto', // Ensure valid CSS value
    },
    overlay: {
      background: '#8686866e',
      zIndex: 20,
    },
  };

  // Convert the token list object to an array
  const tokens = tokenList[network] ? Object.values(tokenList[network]) : [];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
      style={customStyles}
    >
      <div className="modalTitle flex items-center justify-between bg-neutral-button px-8 py-4 text-white">
        <div onClick={closeModal}>
          <Icon name="arrowLeft" />
        </div>
        <div className="text-2xl">Select Token</div>
      </div>
      <div className="modalContent overflow-auto h-full p-8">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="flex items-center text-white pb-6 cursor-pointer"
            onClick={() => modifyToken(token.symbol)}
          >
            <Image
              src={token.img}
              alt={token.name}
              width={60}
              height={60}
              className="pr-4"
            />
            {token.name}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ModalTokensList;
