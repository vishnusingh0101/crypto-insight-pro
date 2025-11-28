import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
  volume: string;
}

const marketData: MarketData[] = [
  { symbol: "BTC", name: "Bitcoin", price: "64,234.50", change: "+2.45", marketCap: "1.26T", volume: "28.5B" },
  { symbol: "ETH", name: "Ethereum", price: "3,456.78", change: "+1.89", marketCap: "415.6B", volume: "15.2B" },
  { symbol: "SOL", name: "Solana", price: "156.23", change: "-0.87", marketCap: "68.4B", volume: "2.8B" },
  { symbol: "BNB", name: "Binance Coin", price: "589.12", change: "+3.21", marketCap: "88.2B", volume: "1.9B" },
];

export const MarketOverview = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        Market Overview
        <span className="text-xs font-normal text-muted-foreground">Live</span>
      </h2>
      <div className="space-y-3">
        {marketData.map((coin) => {
          const isPositive = parseFloat(coin.change) > 0;
          return (
            <div 
              key={coin.symbol} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary text-sm">{coin.symbol}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{coin.name}</p>
                  <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">${coin.price}</p>
                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {coin.change}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
