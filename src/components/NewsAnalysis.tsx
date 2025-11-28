import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoinNews } from "@/services/cryptoApi";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsAnalysisProps {
  coinSymbol: string;
}

export const NewsAnalysis = ({ coinSymbol }: NewsAnalysisProps) => {
  const { data: news, isLoading } = useQuery({
    queryKey: ['coin-news', coinSymbol],
    queryFn: () => fetchCoinNews(coinSymbol),
    staleTime: 5 * 60 * 1000,
  });

  const analyzeSentiment = (title: string) => {
    const bullishWords = ['surge', 'rally', 'gain', 'bullish', 'up', 'high', 'rise', 'soar', 'moon'];
    const bearishWords = ['crash', 'drop', 'fall', 'bearish', 'down', 'low', 'plunge', 'dump'];
    
    const lowerTitle = title.toLowerCase();
    const bullishCount = bullishWords.filter(word => lowerTitle.includes(word)).length;
    const bearishCount = bearishWords.filter(word => lowerTitle.includes(word)).length;
    
    if (bullishCount > bearishCount) return 'Bullish';
    if (bearishCount > bullishCount) return 'Bearish';
    return 'Neutral';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">News Analysis</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const newsItems = news?.slice(0, 5) || [];
  const overallSentiment = newsItems.length > 0 
    ? newsItems.reduce((acc: { [key: string]: number }, item: any) => {
        const sentiment = analyzeSentiment(item.title);
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {})
    : {};

  const dominantSentiment = Object.keys(overallSentiment).reduce((a, b) => 
    overallSentiment[a] > overallSentiment[b] ? a : b
  , 'Neutral');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">News Analysis</h2>
        </div>
        <Badge variant={
          dominantSentiment === "Bullish" ? "default" : 
          dominantSentiment === "Bearish" ? "destructive" : 
          "secondary"
        }>
          {dominantSentiment} Sentiment
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        {newsItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent news available</p>
          </div>
        ) : (
          newsItems.map((item: any, index: number) => {
            const sentiment = analyzeSentiment(item.title);
            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.source?.title || 'Source'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <Badge 
                        variant={
                          sentiment === "Bullish" ? "default" : 
                          sentiment === "Bearish" ? "destructive" : 
                          "secondary"
                        }
                        className="text-xs gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {sentiment}
                      </Badge>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </a>
            );
          })
        )}
      </div>

      {newsItems.length > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Sentiment Overview</h3>
          <div className="flex gap-4 mb-2">
            {Object.entries(overallSentiment).map(([sentiment, count]) => (
              <div key={sentiment} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  sentiment === "Bullish" ? "bg-success" : 
                  sentiment === "Bearish" ? "bg-destructive" : 
                  "bg-secondary"
                }`} />
                <span className="text-sm text-foreground">{sentiment}: {count as number}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Recent news shows {dominantSentiment.toLowerCase()} sentiment towards {coinSymbol.toUpperCase()}.
          </p>
        </div>
      )}
    </Card>
  );
};
