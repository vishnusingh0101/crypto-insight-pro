import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const analyzeSentiment = (text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
  const bullishWords = [
    'surge', 'rally', 'gain', 'bullish', 'up', 'high', 'rise', 'soar', 'moon',
    'breakthrough', 'adoption', 'approval', 'positive', 'growth', 'profit',
    'increase', 'boost', 'optimistic', 'upgrade', 'partnership', 'success',
    'innovation', 'investment', 'outperform', 'momentum', 'strength'
  ];
  
  const bearishWords = [
    'crash', 'drop', 'fall', 'bearish', 'down', 'low', 'plunge', 'dump',
    'decline', 'loss', 'negative', 'concern', 'worry', 'risk', 'threat',
    'decrease', 'weak', 'pessimistic', 'downgrade', 'lawsuit', 'scam',
    'hack', 'fraud', 'regulation', 'ban', 'crackdown', 'investigation'
  ];
  
  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
  const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
  
  if (bullishCount > bearishCount * 1.2) return 'BULLISH';
  if (bearishCount > bullishCount * 1.2) return 'BEARISH';
  return 'NEUTRAL';
};

const searchNews = async (coinName: string, coinSymbol: string): Promise<NewsSource[]> => {
  const searches = [
    `${coinName} ${coinSymbol} news federal reserve SEC`,
    `${coinName} ${coinSymbol} government regulation policy`,
    `${coinName} ${coinSymbol} institutional investment adoption`,
    `${coinName} ${coinSymbol} market analysis price prediction`,
    `${coinName} ${coinSymbol} technology development partnership`
  ];

  const allResults: NewsSource[] = [];
  
  for (const query of searches) {
    try {
      console.log(`Searching for: ${query}`);
      
      // Using a free web search API (you can replace with your preferred API)
      // For demo purposes, using DuckDuckGo's unofficial API
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&t=lovable`;
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract news from DuckDuckGo results
        if (data.RelatedTopics) {
          for (const topic of data.RelatedTopics.slice(0, 5)) {
            if (topic.FirstURL && topic.Text) {
              allResults.push({
                title: topic.Text.substring(0, 150),
                url: topic.FirstURL,
                source: new URL(topic.FirstURL).hostname,
                date: new Date().toISOString(),
                snippet: topic.Text.substring(0, 200)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
    }
  }

  // Also try to get news from CryptoPanic API
  try {
    const cryptoPanicUrl = `https://cryptopanic.com/api/free/v1/posts/?auth_token=free&currencies=${coinSymbol.toUpperCase()}&public=true`;
    const response = await fetch(cryptoPanicUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        for (const item of data.results.slice(0, 20)) {
          allResults.push({
            title: item.title,
            url: item.url,
            source: item.source?.title || 'CryptoPanic',
            date: item.created_at,
            snippet: item.title
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching from CryptoPanic:', error);
  }

  return allResults;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinName, coinSymbol } = await req.json();
    
    if (!coinName || !coinSymbol) {
      throw new Error('coinName and coinSymbol are required');
    }

    console.log(`Analyzing news for ${coinName} (${coinSymbol})`);

    // Search for news from multiple sources
    const newsResults = await searchNews(coinName, coinSymbol);
    
    console.log(`Found ${newsResults.length} news items`);

    // Analyze sentiment for each news item
    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;

    for (const news of newsResults) {
      const sentiment = analyzeSentiment(news.title + ' ' + news.snippet);
      if (sentiment === 'BULLISH') bullishCount++;
      else if (sentiment === 'BEARISH') bearishCount++;
      else neutralCount++;
    }

    // Calculate overall sentiment
    const total = bullishCount + bearishCount + neutralCount;
    const bullishPercent = total > 0 ? (bullishCount / total) * 100 : 0;
    const bearishPercent = total > 0 ? (bearishCount / total) * 100 : 0;
    
    let overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (bullishPercent > 50) {
      overall = 'BULLISH';
      signal = 'BUY';
      confidence = Math.min(95, Math.round(bullishPercent));
    } else if (bearishPercent > 50) {
      overall = 'BEARISH';
      signal = 'SELL';
      confidence = Math.min(95, Math.round(bearishPercent));
    } else {
      overall = 'NEUTRAL';
      signal = 'HOLD';
      confidence = Math.max(40, Math.min(60, Math.round((neutralCount / total) * 100)));
    }

    const analysis: SentimentAnalysis = {
      overall,
      confidence,
      signal,
      bullishCount,
      bearishCount,
      neutralCount,
      sources: newsResults.slice(0, 30) // Return top 30 sources
    };

    console.log(`Analysis complete: ${overall} (${confidence}% confidence) - Signal: ${signal}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-coin-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
