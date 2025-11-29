import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, Clock, TrendingUp, AlertCircle, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewsAnalysisProps {
  coinSymbol: string;
  coinName: string;
}

interface NewsSource {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
}

interface SentimentAnalysis {
  overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  sources: NewsSource[];
}

export const NewsAnalysis = ({ coinSymbol, coinName }: NewsAnalysisProps) => {
  const { data: analysis, isLoading, error } = useQuery<SentimentAnalysis>({
    queryKey: ['coin-news-analysis', coinSymbol],
    queryFn: async () => {
      console.log('Fetching advanced news analysis for', coinSymbol);
      const { data, error } = await supabase.functions.invoke('analyze-coin-news', {
        body: { coinName, coinSymbol }
      });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });


  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Advanced News Analysis</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load news analysis. Please try again later.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  const newsItems = analysis?.sources || [];
  const totalNewsCount = newsItems.length;

  const getSignalIcon = (signal: string) => {
    if (signal === 'BUY') return <TrendingUp className="w-5 h-5" />;
    if (signal === 'SELL') return <TrendingDown className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'BUY') return 'bg-success text-success-foreground';
    if (signal === 'SELL') return 'bg-destructive text-destructive-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Advanced News Analysis</h2>
          <Badge variant="outline" className="ml-2">
            {totalNewsCount} sources analyzed
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge variant={
            analysis?.overall === "BULLISH" ? "default" : 
            analysis?.overall === "BEARISH" ? "destructive" : 
            "secondary"
          }>
            {analysis?.overall} Sentiment
          </Badge>
        </div>
      </div>

      {/* Signal Alert */}
      <Alert className={`mb-6 ${getSignalColor(analysis?.signal || 'HOLD')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getSignalIcon(analysis?.signal || 'HOLD')}
            <div>
              <h3 className="font-bold text-lg">Signal: {analysis?.signal}</h3>
              <p className="text-sm opacity-90">
                Based on {totalNewsCount} news sources from major platforms, government sites, and crypto outlets
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{analysis?.confidence}%</div>
            <div className="text-xs opacity-90">Confidence</div>
          </div>
        </div>
      </Alert>

      <div className="space-y-3 mb-6">
        {newsItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No news sources found</p>
          </div>
        ) : (
          newsItems.slice(0, 15).map((item: NewsSource, index: number) => (
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
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {item.snippet}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium">{item.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))
        )}
      </div>

      {analysis && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">Public Sentiment Distribution</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center p-3 bg-success/20 rounded-lg">
              <div className="text-2xl font-bold text-success">{analysis.bullishCount}</div>
              <div className="text-xs text-muted-foreground">Bullish Sources</div>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary-foreground">{analysis.neutralCount}</div>
              <div className="text-xs text-muted-foreground">Neutral Sources</div>
            </div>
            <div className="text-center p-3 bg-destructive/20 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{analysis.bearishCount}</div>
              <div className="text-xs text-muted-foreground">Bearish Sources</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Comprehensive analysis of {totalNewsCount} sources including major news platforms, government sites (SEC, Federal Reserve, etc.), 
            institutional reports, and crypto-specific outlets. Sentiment analyzed from headlines, snippets, and public discourse across multiple platforms.
          </p>
        </div>
      )}
    </Card>
  );
};
