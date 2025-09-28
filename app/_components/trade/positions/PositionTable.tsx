import PositionTableRow from './PositionTableRow';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import OrderbookABI from '@/app/_libs/utils/abis/Orderbook.json';
import { useEthersProvider } from '@/app/_libs/utils/ethers';
import { useWatchContractEvent, useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { ORDERBOOK_ADDRESS } from '@/app/_libs/utils/constants/contractAddresses';
import AjaxPagination from '../../share/ajaxPagination';

interface OrderPlacedEventArgs {
  orderId: ethers.BigNumber;
  trader: string;
  orderType: number;
  price: ethers.BigNumber;
  amount: ethers.BigNumber;
  stoploss: ethers.BigNumber;
  takeprofit: ethers.BigNumber;
  expiration: ethers.BigNumber;
  asset: string;
}

interface Order {
  orderId: string;
  trader: string;
  orderType: string;
  price: string;
  amount: string;
  total: string;
  stoploss: string;
  takeprofit: string;
  expiration: string;
  asset: string;
  progress: number;
}

export default function PositionTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [handledOrderIds, setHandledOrderIds] = useState<Set<string>>(
    new Set()
  ); // Track handled order IDs
  const provider = useEthersProvider();
  // const { address } = useAccount();
  const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  // Fetch user orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiURL = `http://195.248.240.173:8000/orders/?wallet_address=${address}&page=${page}&per_page=5`;
      const response = await fetch(apiURL);
      const data = await response.json();

      setOrders(data.orders);
      setPagination(data.pagination[0]);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check contract event
  const handleOrderPlaced = (logs: any[]) => {
    logs.forEach((log) => {
      const args = log.args as OrderPlacedEventArgs;
      if (!handledOrderIds.has(args.orderId.toString())) {
        setHandledOrderIds(
          (prev) => new Set(prev.add(args.orderId.toString()))
        );
        toast.success(
          `New Order Placed: ${args.orderId.toString()} by ${args.trader}`
        );
      }
    });
  };

  useWatchContractEvent({
    address: ORDERBOOK_ADDRESS,
    abi: OrderbookABI,
    eventName: 'OrderPlaced',
    onLogs: handleOrderPlaced,
  });

  // Fetch orders on component mount
  useEffect(() => {
    if (address) {
      fetchOrders();
    }
  }, [address, page]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <table className="w-full text-left text-white">
        <thead>
          <tr className="border-b border-neutral-button leading-9 text-center">
            <th>Market</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Side</th>
            <th>Type</th>
            <th>Expiration</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <PositionTableRow key={order.orderId} order={order} />
          ))}
        </tbody>
      </table>

      <AjaxPagination
        itemsPerPage={5}
        totalItems={pagination.total}
        currentPage={page}
        changePagination={(page) => setPage(page)}
      />
    </div>
  );
}
