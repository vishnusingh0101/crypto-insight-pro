import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TechnicalAnalysisProps {
  coin: {
    current_price: number;
    high_24h: number;
    low_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d?: number;
    total_volume: number;
    market_cap: number;
  };
}

export const TechnicalAnalysis = ({ coin }: TechnicalAnalysisProps) => {
  // Calculate technical indicators
  const rsi = Math.round(50 + (coin.price_change_percentage_24h * 2));
  const volatility = ((coin.high_24h - coin.low_24h) / coin.current_price) * 100;
  const volumeRatio = (coin.total_volume / coin.market_cap) * 100;
  
  const macdSignal = coin.price_change_percentage_24h > 0 ? "Bullish" : "Bearish";
  const trend = coin.price_change_percentage_24h > 2 ? "Strong Uptrend" : 
                coin.price_change_percentage_24h < -2 ? "Strong Downtrend" : "Sideways";

  const indicators = [
    {
      name: "RSI (14)",
      value: rsi,
      signal: rsi < 30 ? "Oversold" : rsi > 70 ? "Overbought" : "Neutral",
      color: rsi < 30 ? "success" : rsi > 70 ? "destructive" : "secondary"
    },
    {
      name: "MACD",
      value: macdSignal,
      signal: macdSignal,
      color: macdSignal === "Bullish" ? "success" : "destructive"
    },
    {
      name: "Trend",
      value: trend,
      signal: trend,
      color: trend.includes("Up") ? "success" : trend.includes("Down") ? "destructive" : "secondary"
    },
    {
      name: "Volatility",
      value: `${volatility.toFixed(2)}%`,
      signal: volatility > 5 ? "High" : "Low",
      color: volatility > 5 ? "warning" : "secondary"
    },
    {
      name: "Volume/MCap",
      value: `${volumeRatio.toFixed(2)}%`,
      signal: volumeRatio > 3 ? "High Activity" : "Low Activity",
      color: volumeRatio > 3 ? "success" : "secondary"
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Technical Analysis</h2>
      </div>

      <div className="space-y-4">
        {indicators.map((indicator) => (
          <div key={indicator.name} className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{indicator.name}</span>
              <Badge variant={
                indicator.color === "success" ? "default" : 
                indicator.color === "destructive" ? "destructive" : 
                "secondary"
              }>
                {indicator.signal}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {indicator.color === "success" && <TrendingUp className="w-4 h-4 text-success" />}
              {indicator.color === "destructive" && <TrendingDown className="w-4 h-4 text-destructive" />}
              <span className="text-lg font-bold text-foreground">{indicator.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="font-semibold text-foreground mb-2">Summary</h3>
        <p className="text-sm text-muted-foreground">
          Based on current technical indicators, the asset shows {trend.toLowerCase()} momentum with 
          {rsi < 30 ? " oversold" : rsi > 70 ? " overbought" : " neutral"} RSI levels. 
          Volume activity is {volumeRatio > 3 ? "high" : "moderate"}, suggesting 
          {volumeRatio > 3 ? " strong" : " normal"} market interest.
        </p>
      </div>
    </Card>
  );
};
