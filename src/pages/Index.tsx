import { SignalCard } from "@/components/SignalCard";
import { NewsCard } from "@/components/NewsCard";
import { MarketOverview } from "@/components/MarketOverview";
import { CoinSearch } from "@/components/CoinSearch";
import { Activity, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchTopCoins, generateSignal, calculateConfidence, calculateRSI } from "@/services/cryptoApi";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: coins, isLoading } = useQuery({
    queryKey: ['top-coins'],
    queryFn: () => fetchTopCoins(20),
    refetchInterval: 60000, // Refetch every minute
  });

  const signals = coins?.slice(0, 8).map(coin => {
    const signal = generateSignal(coin);
    const confidence = calculateConfidence(coin);
    const rsi = calculateRSI([coin.low_24h, coin.current_price, coin.high_24h]);
    
    return {
      coinId: coin.id,
      symbol: `${coin.symbol.toUpperCase()}/USDT`,
      name: coin.name,
      signal,
      price: coin.current_price.toFixed(2),
      change: coin.price_change_percentage_24h.toFixed(2),
      confidence,
      indicators: {
        rsi: Math.round(rsi),
        macd: signal === "BUY" ? "Bullish" : signal === "SELL" ? "Bearish" : "Neutral",
        volume: coin.total_volume > 1e9 ? "High" : coin.total_volume > 5e8 ? "Medium" : "Low"
      }
    };
  }) || [];

  const news = [
    {
      title: "Bitcoin ETF Sees Record Inflows of $2.1B in Single Week",
      source: "CoinDesk",
      time: "2h ago",
      impact: "High" as const,
      sentiment: "Bullish" as const,
      excerpt: "Major institutional investors continue to pour capital into Bitcoin ETFs, signaling strong market confidence."
    },
    {
      title: "Ethereum Network Completes Major Upgrade, Gas Fees Drop 40%",
      source: "CryptoNews",
      time: "5h ago",
      impact: "High" as const,
      sentiment: "Bullish" as const,
      excerpt: "The latest protocol upgrade brings significant improvements to transaction efficiency and cost reduction."
    },
    {
      title: "SEC Delays Decision on Multiple Crypto ETF Applications",
      source: "Bloomberg",
      time: "8h ago",
      impact: "Medium" as const,
      sentiment: "Bearish" as const,
      excerpt: "Regulatory uncertainty continues as the SEC postpones decisions on several pending cryptocurrency ETF proposals."
    },
    {
      title: "DeFi Protocol Launches Cross-Chain Bridge with Enhanced Security",
      source: "DeFi Pulse",
      time: "12h ago",
      impact: "Medium" as const,
      sentiment: "Bullish" as const,
      excerpt: "New cross-chain infrastructure promises improved interoperability between major blockchain networks."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CryptoSignal Pro</h1>
                <p className="text-xs text-muted-foreground">Advanced Blockchain Analysis</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <CoinSearch />
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Active Signals</p>
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12% this week
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-foreground">78.5%</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +2.3% today
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
            <p className="text-2xl font-bold text-foreground">82%</p>
            <p className="text-xs text-muted-foreground mt-1">High reliability</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Markets Analyzed</p>
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-xs text-primary mt-1">Real-time tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signals Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Trading Signals</h2>
              <span className="text-sm text-muted-foreground">Live from CoinGecko API</span>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((signal) => (
                  <SignalCard key={signal.coinId} {...signal} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MarketOverview />
            
            {/* News Section */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Latest News</h2>
              <div className="space-y-3">
                {news.map((item, index) => (
                  <NewsCard key={index} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
