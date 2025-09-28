'use client';
import React, { useState, useEffect, useRef, memo } from 'react';
import { useTokenContext } from '@/app/_context/TokenContext';
import { tokenList } from '@/app/_libs/utils/constants/TokenList';

const TradingViewWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT'); // Default crypto symbol
  const { setToken, tokenPrice } = useTokenContext();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      container_id: 'technical-analysis-chart-demo',
      width: '100%',
      height: '100%',
      autosize: true,
      symbol: selectedSymbol, // Use the selected symbol
      interval: 'D',
      timezone: 'exchange',
      theme: 'Dark',
      style: '1',
      withdateranges: true,
      allow_symbol_change: false, // Disable symbol change in the widget
      save_image: false,
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = ''; // Clean up the container when the component is unmounted
      }
    };
  }, [selectedSymbol]);

  const handleSymbolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = event.target.value;
    setSelectedSymbol(newSymbol);
    const token = tokenList.find((t) => t.tradingViewSymbol === newSymbol);

    if (token) {
      setToken(token);
    }
  };

  return (
    <div className="h-full">
      {/* Custom dropdown for selecting a crypto symbol */}
      <div className="flex items-center">
        <select
          className="bg-dark-background text-white border  border-neutral-button w-48 py-2 px-4 rounded-t-lg"
          value={selectedSymbol}
          onChange={handleSymbolChange}
        >
          {tokenList.map((token) => (
            <option
              key={token.tradingViewSymbol}
              value={token.tradingViewSymbol}
            >
              {token.tradingViewSymbol}
            </option>
          ))}
        </select>
        {tokenPrice && (
          <div className="text-white ml-6 text-lg">{`$ ${tokenPrice?.toFixed(
            2
          )}`}</div>
        )}
      </div>

      {/* TradingView widget */}
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      >
        <div
          id="technical-analysis-chart-demo"
          className="tradingview-widget-container__widget"
          style={{ height: 'calc(100% - 230px)', width: '100%' }}
        ></div>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
