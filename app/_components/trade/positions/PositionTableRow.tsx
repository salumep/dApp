import React from 'react';

interface Order {
  orderId: string;
  symbol: string;
  price: string;
  amount: string;
  isBuyOrder: number;
  orderType: number; // '1' for buy, '2' for sell
  stoploss: string;
  takeprofit: string;
  expiration: string;
}

interface PositionTableRowProps {
  order: Order;
}

const PositionTableRow: React.FC<PositionTableRowProps> = ({ order }) => {
  const { amount, price, isBuyOrder, orderType } = order;

  return (
    <tr className="border-b text-sm border-neutral-button text-center">
      <td className="py-4">
        <div className="flex items-center">
          <img
            className="w-4 h-4 mr-2"
            src="https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
            alt="Market Icon"
          />
          <span className="text-white font-medium">USDC</span>
        </div>
      </td>

      <td className="py-4">
        <span className="text-white">{amount}</span>
      </td>

      <td className="py-4">
        <span className="text-white ">{price}</span>
      </td>

      <td className="py-4">
        <span className="text-yellow-500 ">{isBuyOrder ? 'buy' : 'sell'}</span>
      </td>

      <td className="py-4">
        <span className="text-yellow-500 ">
          {orderType == 1 ? 'Limit' : 'Market'}
        </span>
      </td>

      <td className="py-4">
        <span className="text-white ">
          {new Date(Number(order.expiration) * 1000).toLocaleString()}
        </span>
      </td>
    </tr>
  );
};

export default PositionTableRow;
