'use client';
import React from 'react';
import { TokenProvider } from '@/app/_context/TokenContext';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TokenProvider>{children}</TokenProvider>;
}
