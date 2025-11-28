import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SignalCardProps {
  symbol: string;
  name: string;
  signal: "BUY" | "SELL" | "HOLD";
  price: string;
  change: string;
  confidence: number;
  indicators: {
    rsi: number;
    macd: string;
    volume: string;
  };
}

export const SignalCard = ({ symbol, name, signal, price, change, confidence, indicators }: SignalCardProps) => {
  const isPositive = parseFloat(change) > 0;
  const signalColor = signal === "BUY" ? "success" : signal === "SELL" ? "destructive" : "secondary";
  
  const SignalIcon = signal === "BUY" ? TrendingUp : signal === "SELL" ? TrendingDown : Minus;

  return (
    <Card className="p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
            <Badge variant={signalColor === "success" ? "default" : signalColor === "destructive" ? "destructive" : "secondary"} className="gap-1">
              <SignalIcon className="w-3 h-3" />
              {signal}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${price}</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {change}%
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium text-foreground">{confidence}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${confidence >= 70 ? "bg-success" : confidence >= 50 ? "bg-warning" : "bg-destructive"} transition-all duration-500`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">RSI</p>
          <p className="text-sm font-semibold text-foreground">{indicators.rsi}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">MACD</p>
          <p className="text-sm font-semibold text-foreground">{indicators.macd}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Volume</p>
          <p className="text-sm font-semibold text-foreground">{indicators.volume}</p>
        </div>
      </div>
    </Card>
  );
};
