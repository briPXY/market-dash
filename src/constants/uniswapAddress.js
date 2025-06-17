export const DOMAIN = import.meta.env.VITE_DOMAIN ?? "";
export const WSS_DOMAIN = import.meta.env.VITE_WSS_DOMAIN ?? "";

export const PoolAddress = {};

async function fetchAndFormatPoolAddresses(poolURL) {
  try {
    const response = await fetch(poolURL);
    const json = await response.json();
    const flatData = json.data;

    const formatted = {};

    for (const key in flatData) {
      const [tokenA, tokenB] = key.split('-');
      if (!formatted[tokenA]) {
        formatted[tokenA] = {};
      }
      formatted[tokenA][tokenB] = flatData[key];
    }
 
    return formatted;

  } catch (error) {
    console.error('Error fetching pool addresses:', error);
  }
}

PoolAddress.UniswapV3 = await fetchAndFormatPoolAddresses(`${DOMAIN}/api/pooladdress/UniswapV3`);

// Unused
export const TokenAddress = {
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}

export const TokenDecimal = {
    USDT: 6,
    ETH: 18,
    WBTC: 8,
    DAI: 18,
    LINK: 18,
    WETH: 18,
    USDC: 6,
    UNI: 18,
    beraSTONE: 18,
    USDM: 6,
    MKR: 18,
    HKDM: 6,
}