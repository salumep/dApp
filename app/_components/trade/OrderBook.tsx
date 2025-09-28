import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Icon from '../UI/icon';

interface Order {
  price: string;
  amount: string;
  total: string;
  progress?: string;
}

interface OrderbookProps {
  userAddress: string;
}

const Orderbook: React.FC<OrderbookProps> = ({ userAddress }) => {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isConnecting, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const tokenAddress = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';
  const apiURL =
    `https://api.allorigins.win/get?url=` +
    encodeURIComponent(
      `http://195.248.240.173:8000/orderbook/0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43`
    );
  const websocketURL = `wss://195.248.240.173:8000/market-data`;

  const formatOrder = (order: any) => ({
    price: (order.price / 1e6).toFixed(2),
    amount: (order.amount / 1e18).toFixed(4),
    total: ((order.price * order.amount) / (1e6 * 1e18)).toFixed(2),
  });

  // Fetch initial order book from API
  useEffect(() => {
    const fetchOrderbook = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiURL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responsejson = await response.json();
        const data = JSON.parse(responsejson.contents) || {};
        const initialBids = data.bids ? data.bids.map(formatOrder) : [];
        const initialAsks = data.asks ? data.asks.map(formatOrder) : [];

        // Calculate progress for the initial data
        setBids(calculateProgress(initialBids, false));
        setAsks(calculateProgress(initialAsks, true));
      } catch (error) {
        console.error('Error fetching order book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderbook();
  }, [apiURL]);

  // Update the order in the list or add a new one
  const updateOrders = (
    orderList: Order[],
    newOrder: any,
    type: string
  ): Order[] => {
    const formattedOrder = formatOrder(newOrder);
    return [...orderList, formattedOrder];
  };

  const calculateProgress = (orders: Order[], isAsk: boolean) => {
    // Create a copy of the orders to avoid mutating the original array
    const progressOrders = [...orders];

    // Reverse orders for asks to calculate progress from bottom to top
    if (isAsk) {
      progressOrders.reverse();
    }

    // Calculate cumulative total for each order
    let cumulativeTotal = 0;
    progressOrders.forEach((order) => {
      cumulativeTotal += parseFloat(order.amount);
    });

    // Calculate progress based on cumulative total
    let currentTotal = 0;
    progressOrders.forEach((order) => {
      currentTotal += parseFloat(order.amount);
      // Set total as cumulative sum
      order.total = `${currentTotal}`;
      // Set progress based on the proportion of the current cumulative total to the overall cumulative total
      order.progress = `${(currentTotal / cumulativeTotal) * 100}%`;
    });

    // Reverse back if it's an ask
    if (isAsk) {
      progressOrders.reverse();
    }

    return progressOrders;
  };

  console.log(bids);

  // Handle WebSocket updates
  useEffect(() => {
    const socket = new WebSocket(websocketURL);

    socket.onopen = () => {
      console.log('WebSocket connected');
      const subscriptionMessage = JSON.stringify({
        action: 'subscription',
        channel: 'order_book',
        symbol: tokenAddress,
      });
      socket.send(subscriptionMessage);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.channel === 'order_book' && message.symbol === tokenAddress) {
        if (message.data.bids) {
          setBids((prevBids) =>
            calculateProgress(
              updateOrders(prevBids, message.data.bids[0], 'bid'),
              false
            )
          );
        }
        if (message.data.asks) {
          setAsks((prevAsks) =>
            calculateProgress(
              updateOrders(prevAsks, message.data.asks[0], 'ask'),
              true
            )
          );
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [websocketURL, tokenAddress]);

  if (loading) return <p>Loading...</p>;
  console.log(asks);
  return (
    <div>
      {isConnected ? (
        <>
          <table className="text-center w-full">
            <thead className="text-neutral-light h-10">
              <tr>
                <th className="px-2">
                  Price{' '}
                  <span className="px-2 py-1 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                    USDC
                  </span>
                </th>
                <th>
                  Size{' '}
                  <span className="px-2 py-1 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                    USDC
                  </span>
                </th>
                <th>
                  Total{' '}
                  <span className="px-2 py-1 bg-teal-500 bg-opacity-25 rounded-full text-white text-sm font-[Inter] italic font-light">
                    USDC
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-white leading-9">
              {asks.map((order, index) => (
                <tr
                  key={index}
                  style={{
                    position: 'relative',
                    height: '20px',
                  }}
                >
                  <td>{order.price}</td>
                  <td>{order.amount}</td>
                  <td>{order.total}</td>
                  <td
                    style={{
                      position: 'absolute',
                      width: order.progress || '0%',
                      top: '4px',
                      bottom: '4px',
                      right: 0,
                      background: 'rgba(238, 43, 73, 0.20)', // Progress bar color for sell orders
                    }}
                  ></td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="text-neutral-light italic">
                  Price : 3800
                </td>
              </tr>
            </tbody>
          </table>
          <table className="text-center w-full">
            <tbody className="text-white leading-9">
              {bids.map((order, index) => (
                <tr
                  key={index}
                  style={{
                    position: 'relative',
                    height: '20px',
                  }}
                >
                  <td>{order.price}</td>
                  <td>{order.amount}</td>
                  <td>{order.total}</td>
                  <td
                    style={{
                      position: 'absolute',
                      width: order.progress || '0%',
                      top: '4px',
                      bottom: '4px',
                      right: 0,
                      background:
                        'linear-gradient(90deg, rgba(20, 184, 166, 0.15) 100%, rgba(20, 184, 166, 0) 0)', // Progress bar color for buy orders
                    }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="mt-16">
          <button
            className="btn text-white w-full bg-warning-button py-2 rounded-2xl px-4 "
            onClick={async () => {
              if (isConnected) {
                disconnect();
              }
              openConnectModal?.();
            }}
            disabled={isConnecting}
          >
            {isConnecting ? (
              'Connecting...'
            ) : (
              <div className="flex justify-center">
                <Icon name="warning" />
                <div className="pl-2">Connect wallet</div>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
export default Orderbook;
