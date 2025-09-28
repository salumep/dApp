import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
export default function SwapButton({
  executeSwap,
  isDisable,
  warningMessage,
}: {
  executeSwap: () => void;
  isDisable: boolean;
  warningMessage: string;
}) {
  const { isConnecting, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  return (
    <div className="pt-12 text-right flex justify-end items-end">
      {warningMessage != '' && (
        <div className="text-white bg-warning-button py-1 px-3 rounded-xl mr-auto flex items-center">
          {warningMessage}
        </div>
      )}

      {!isConnected ? (
        <button
          className="btn text-white border py-2 rounded-2xl px-4 border-neutral-light"
          onClick={async () => {
            // Disconnecting wallet first because sometimes when is connected but the user is not connected
            if (isConnected) {
              disconnect();
            }
            openConnectModal?.();
          }}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect wallet'}
        </button>
      ) : (
        <button
          onClick={executeSwap}
          className="btn text-white border py-2 rounded-2xl px-4 border-neutral-light w-52"
          disabled={isDisable}
        >
          swap
        </button>
      )}
    </div>
  );
}
