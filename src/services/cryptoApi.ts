const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  atl: number;
  market_cap_rank: number;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: string;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    total_supply: number;
    ath: { usd: number };
    atl: { usd: number };
    market_cap_rank: number;
  };
}

export const fetchTopCoins = async (limit: number = 50): Promise<CoinData[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    if (!response.ok) throw new Error('Failed to fetch coins');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return [];
  }
};

export const fetchCoinDetail = async (coinId: string): Promise<CoinDetail | null> => {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
    );
    if (!response.ok) throw new Error('Failed to fetch coin detail');
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin detail:', error);
    return null;
  }
};

export const fetchCoinNews = async (coinSymbol: string) => {
  // Using CryptoPanic free API endpoint (no key needed for basic usage)
  try {
    const response = await fetch(
      `https://cryptopanic.com/api/free/v1/posts/?auth_token=free&currencies=${coinSymbol.toUpperCase()}&public=true`
    );
    if (!response.ok) throw new Error('Failed to fetch news');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Calculate RSI (Relative Strength Index)
export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// Generate signal based on technical indicators
export const generateSignal = (coin: CoinData): 'BUY' | 'SELL' | 'HOLD' => {
  const priceChange = coin.price_change_percentage_24h;
  const rsi = calculateRSI([coin.low_24h, coin.current_price, coin.high_24h]);
  
  if (priceChange > 5 && rsi < 70) return 'BUY';
  if (priceChange < -5 || rsi > 70) return 'SELL';
  return 'HOLD';
};

// Calculate confidence score
export const calculateConfidence = (coin: CoinData): number => {
  let score = 50;
  const priceChange = Math.abs(coin.price_change_percentage_24h);
  const volumeToMarketCap = (coin.total_volume / coin.market_cap) * 100;
  
  if (priceChange > 3) score += 15;
  if (priceChange > 7) score += 10;
  if (volumeToMarketCap > 5) score += 15;
  if (coin.market_cap_rank <= 10) score += 10;
  
  return Math.min(Math.round(score), 95);
};
