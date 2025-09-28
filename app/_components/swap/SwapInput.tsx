import React, { ChangeEvent } from 'react';
import Image from 'next/image';
import Icon from '../UI/icon';
import {
  tokenList,
  NetworkName,
} from '@/app/_libs/utils/constants/swapConstants';

interface Token {
  ticker: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
}
interface props {
  tokenSymbol: string;
  network: NetworkName;
  tokenAmount: number | string;
  tokenWraptitle: string;
  clearAction: () => void;
  changeToken: () => void;
  disable: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  tokenPrice: number;
  balance?: string;
  maxAction?: () => void;
}

const SwapInput: React.FC<props> = ({
  tokenSymbol,
  network,
  tokenAmount,
  tokenWraptitle,
  clearAction,
  changeToken,
  disable,
  onChange,
  tokenPrice,
  balance,
  maxAction,
}) => {
  const token = tokenList[network]?.[tokenSymbol];
  return (
    <div>
      <div className="tokenSwapWrap text-white">
        <div className="flex justify-between pb-2 ">
          <div>{tokenWraptitle}</div>
          {!disable && (
            <div className="cursor-pointer" onClick={clearAction}>
              clear
            </div>
          )}
        </div>
        <div className="flex justify-between bg-third-layer-bg p-4 rounded-xl">
          {token ? (
            <div className="flex justify-start w-52">
              <Image src={token.img} alt={token.name} width="64" height="64" />
              <div className="pl-4 cursor-pointer" onClick={changeToken}>
                <div className="flex items-center">
                  <span className="pr-4">{token.ticker} </span>
                  <Icon name="arrowDown" />
                </div>
                <div className="text-neutral-light pt-4">{token.name}</div>
              </div>
            </div>
          ) : (
            <div className="pl-4 cursor-pointer" onClick={changeToken}>
              selectToken
            </div>
          )}

          <input
            placeholder="0"
            className="bg-transparent justify-center text-center flex-grow text-xl text-white"
            value={tokenAmount}
            pattern="[0-9]*\.?[0-9]*"
            disabled={disable}
            onChange={onChange}
          />
          <div className="flex items-center justify-end w-52">
            <div className=" h-full flex flex-col justify-center">
              {!disable && (
                <div className="flex items-center mb-4 ">
                  <span>your balance:</span>
                  <span className="pl-1">{balance}</span>
                  <div
                    className="ml-2 px-3 py-1 cursor-pointer rounded-full bg-platform-bg-gradient text-sm"
                    onClick={maxAction}
                  >
                    max
                  </div>
                </div>
              )}

              <div className="text-right text-neutral-light">
                ~ ${tokenPrice}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SwapInput;
