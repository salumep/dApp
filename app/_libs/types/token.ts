export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}
export interface Token {
  id: string;
  ticker: string;
  img: string;
  name: string;
  address: string;
  decimals: number;
  tradingViewSymbol: string;
  chainlinkFeedAddress: string;
}
