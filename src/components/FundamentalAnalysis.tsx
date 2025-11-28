import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, BarChart3, Target } from "lucide-react";

interface FundamentalAnalysisProps {
  coin: {
    name: string;
    market_cap: number;
    total_volume: number;
    circulating_supply: number;
    total_supply: number;
    ath: number;
    atl: number;
    current_price: number;
    market_cap_rank: number;
  };
}

export const FundamentalAnalysis = ({ coin }: FundamentalAnalysisProps) => {
  const athDistance = ((coin.current_price / coin.ath) * 100).toFixed(2);
  const atlDistance = ((coin.current_price / coin.atl) * 100).toFixed(2);
  const supplyCirculation = ((coin.circulating_supply / coin.total_supply) * 100).toFixed(2);
  const volumeToMcap = ((coin.total_volume / coin.market_cap) * 100).toFixed(2);

  const metrics = [
    {
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
      label: "Market Cap Rank",
      value: `#${coin.market_cap_rank}`,
      description: "Position among all cryptocurrencies"
    },
    {
      icon: <Coins className="w-5 h-5 text-success" />,
      label: "Supply Circulation",
      value: `${supplyCirculation}%`,
      description: `${(coin.circulating_supply / 1e9).toFixed(2)}B / ${(coin.total_supply / 1e9).toFixed(2)}B`
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-primary" />,
      label: "Volume/MCap Ratio",
      value: `${volumeToMcap}%`,
      description: "Trading activity relative to market cap"
    },
    {
      icon: <Target className="w-5 h-5 text-success" />,
      label: "ATH Distance",
      value: `${athDistance}%`,
      description: `All-time high: $${coin.ath.toLocaleString()}`
    }
  ];

  const fundamentalScore = () => {
    let score = 0;
    if (coin.market_cap_rank <= 10) score += 25;
    else if (coin.market_cap_rank <= 50) score += 15;
    if (parseFloat(volumeToMcap) > 5) score += 25;
    if (parseFloat(athDistance) < 50) score += 25;
    if (parseFloat(supplyCirculation) > 70) score += 25;
    return score;
  };

  const score = fundamentalScore();
  const rating = score >= 75 ? "Strong" : score >= 50 ? "Moderate" : "Weak";

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Fundamental Analysis</h2>

      <div className="space-y-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-1">{metric.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-lg font-bold text-foreground">{metric.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Fundamental Score</h3>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-foreground">{score}/100</div>
            <span className={`text-sm font-medium ${
              rating === "Strong" ? "text-success" : 
              rating === "Moderate" ? "text-warning" : 
              "text-destructive"
            }`}>
              {rating}
            </span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              rating === "Strong" ? "bg-success" : 
              rating === "Moderate" ? "bg-warning" : 
              "bg-destructive"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {coin.name} shows {rating.toLowerCase()} fundamentals based on market position, 
          liquidity, and supply metrics. {coin.market_cap_rank <= 10 && "Top 10 market cap indicates strong adoption."}
        </p>
      </div>
    </Card>
  );
};
