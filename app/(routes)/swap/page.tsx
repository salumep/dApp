import Tabs from '@/app/_components/share/Tabs';
import Image from 'next/image';
import React from 'react';
import LimitTab from '@/app/_components/swap/LimitTab';
import SwapTab from '@/app/_components/swap/SwapTab';

export default function Swap() {
  const tabs = [
    {
      id: 1, // Changed to number
      label: 'Swap',
      content: SwapTab, // Pass the component itself
    },
    // {
    //   id: 2, // Changed to number
    //   label: 'Limit',
    //   content: LimitTab, // Pass the component itself
    // },
  ];

  return (
    <div>
      <div className="topBanner h-44 flex overflow-hidden items-end ">
        <Image
          src="/images/swap-header.jpg"
          alt="start trading"
          width={1920}
          height={250}
        />
      </div>
      <Tabs tabs={tabs} />
    </div>
  );
}
