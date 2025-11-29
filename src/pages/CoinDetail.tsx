import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCoinDetail } from "@/services/cryptoApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { TechnicalAnalysis } from "@/components/TechnicalAnalysis";
import { FundamentalAnalysis } from "@/components/FundamentalAnalysis";
import { NewsAnalysis } from "@/components/NewsAnalysis";
import { Skeleton } from "@/components/ui/skeleton";

const CoinDetail = () => {
  const { coinId } = useParams();
  const navigate = useNavigate();

  const { data: coin, isLoading } = useQuery({
    queryKey: ['coin-detail', coinId],
    queryFn: () => fetchCoinDetail(coinId || ''),
    enabled: !!coinId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Coin not found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const priceChange = coin.market_data.price_change_percentage_24h;
  const isPositive = priceChange > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Coin Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{coin.name}</h1>
                <span className="text-2xl text-muted-foreground">{coin.symbol.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-foreground">
                  ${coin.market_data.current_price.usd.toLocaleString()}
                </span>
                <div className={`flex items-center gap-1 text-lg font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                  {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  {Math.abs(priceChange).toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Market Cap Rank</div>
              <div className="text-2xl font-bold text-primary">#{coin.market_data.market_cap_rank}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h High</p>
              <p className="text-lg font-semibold text-foreground">${coin.market_data.high_24h.usd.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Low</p>
              <p className="text-lg font-semibold text-foreground">${coin.market_data.low_24h.usd.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
              <p className="text-lg font-semibold text-foreground">${(coin.market_data.market_cap.usd / 1e9).toFixed(2)}B</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
              <p className="text-lg font-semibold text-foreground">${(coin.market_data.total_volume.usd / 1e9).toFixed(2)}B</p>
            </div>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicalAnalysis 
            coin={{
              current_price: coin.market_data.current_price.usd,
              high_24h: coin.market_data.high_24h.usd,
              low_24h: coin.market_data.low_24h.usd,
              price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
              price_change_percentage_7d: coin.market_data.price_change_percentage_7d,
              total_volume: coin.market_data.total_volume.usd,
              market_cap: coin.market_data.market_cap.usd,
            }}
          />
          
          <FundamentalAnalysis 
            coin={{
              name: coin.name,
              market_cap: coin.market_data.market_cap.usd,
              total_volume: coin.market_data.total_volume.usd,
              circulating_supply: coin.market_data.circulating_supply,
              total_supply: coin.market_data.total_supply,
              ath: coin.market_data.ath.usd,
              atl: coin.market_data.atl.usd,
              current_price: coin.market_data.current_price.usd,
              market_cap_rank: coin.market_data.market_cap_rank,
            }}
          />

          <div className="lg:col-span-2">
            <NewsAnalysis coinSymbol={coin.symbol} coinName={coin.name} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoinDetail;
