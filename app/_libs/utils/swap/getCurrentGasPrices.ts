import { ethers } from 'ethers';
export const getCurrentGasPrices = async (
  provider: ethers.providers.BaseProvider
) => {
  const gasPrice = await provider.getGasPrice();
  return gasPrice;
};
