import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const CoinSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['coin-search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`${COINGECKO_BASE_URL}/search?query=${searchQuery}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data.coins.slice(0, 5);
    },
    enabled: searchQuery.length >= 2,
  });

  const handleAnalyze = () => {
    if (!selectedCoin) {
      toast({
        title: "No coin selected",
        description: "Please search and select a coin to analyze",
        variant: "destructive",
      });
      return;
    }
    navigate(`/coin/${selectedCoin}`);
  };

  const handleSelectCoin = (coinId: string, coinName: string) => {
    setSelectedCoin(coinId);
    setSearchQuery(coinName);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Search & Analyze Any Coin</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Enter any cryptocurrency name to get comprehensive technical, fundamental, and news analysis
      </p>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search coin (e.g., Bitcoin, Ethereum, Cardano...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          
          {searchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              {searchResults.map((coin: any) => (
                <button
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin.id, coin.name)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-0"
                >
                  {coin.thumb && (
                    <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{coin.name}</div>
                    <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Rank #{coin.market_cap_rank}</div>
                </button>
              ))}
            </div>
          )}
          
          {searchQuery.length >= 2 && !isLoading && searchResults?.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
              No coins found. Try a different search term.
            </div>
          )}
        </div>

        <Button 
          onClick={handleAnalyze}
          disabled={!selectedCoin}
          className="gap-2 px-6"
        >
          <TrendingUp className="w-4 h-4" />
          Analyze
        </Button>
      </div>

      {selectedCoin && (
        <div className="mt-3 text-sm text-muted-foreground">
          Ready to analyze: <span className="font-medium text-foreground">{searchQuery}</span>
        </div>
      )}
    </Card>
  );
};
