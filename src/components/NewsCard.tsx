import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface NewsCardProps {
  title: string;
  source: string;
  time: string;
  impact: "High" | "Medium" | "Low";
  sentiment: "Bullish" | "Bearish" | "Neutral";
  excerpt: string;
}

export const NewsCard = ({ title, source, time, impact, sentiment, excerpt }: NewsCardProps) => {
  const impactColor = impact === "High" ? "destructive" : impact === "Medium" ? "warning" : "secondary";
  const sentimentColor = sentiment === "Bullish" ? "success" : sentiment === "Bearish" ? "destructive" : "secondary";

  return (
    <Card className="p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-2 h-2 mt-2 rounded-full bg-primary animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{excerpt}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">{source}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {time}
            </div>
            <Badge 
              variant={impactColor === "destructive" ? "destructive" : impactColor === "warning" ? "secondary" : "outline"}
              className="text-xs"
            >
              {impact} Impact
            </Badge>
            <Badge 
              variant={sentimentColor === "success" ? "default" : sentimentColor === "destructive" ? "destructive" : "secondary"}
              className="text-xs gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              {sentiment}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
