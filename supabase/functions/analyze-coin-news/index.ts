import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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

const analyzeSentiment = (text: string): { sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL', score: number } => {
  const bullishWords = [
    'surge', 'rally', 'gain', 'bullish', 'up', 'high', 'rise', 'soar', 'moon', 'pump',
    'breakthrough', 'adoption', 'approval', 'positive', 'growth', 'profit', 'bull',
    'increase', 'boost', 'optimistic', 'upgrade', 'partnership', 'success', 'all-time high',
    'innovation', 'investment', 'outperform', 'momentum', 'strength', 'accumulation',
    'breakout', 'institutional', 'etf', 'sec approval', 'mass adoption', 'golden cross'
  ];
  
  const bearishWords = [
    'crash', 'drop', 'fall', 'bearish', 'down', 'low', 'plunge', 'dump', 'bear',
    'decline', 'loss', 'negative', 'concern', 'worry', 'risk', 'threat', 'collapse',
    'decrease', 'weak', 'pessimistic', 'downgrade', 'lawsuit', 'scam', 'ponzi',
    'hack', 'fraud', 'regulation', 'ban', 'crackdown', 'investigation', 'seizure',
    'manipulation', 'death cross', 'resistance', 'rejection', 'fear', 'panic'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Count word occurrences with weights
  let bullishScore = 0;
  let bearishScore = 0;
  
  for (const word of bullishWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      bullishScore += matches.length * (word.length > 10 ? 2 : 1); // Longer phrases get more weight
    }
  }
  
  for (const word of bearishWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      bearishScore += matches.length * (word.length > 10 ? 2 : 1);
    }
  }
  
  const totalScore = bullishScore + bearishScore;
  const confidence = totalScore > 0 ? Math.max(bullishScore, bearishScore) / totalScore : 0.5;
  
  let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  
  if (bullishScore > bearishScore * 1.3) {
    sentiment = 'BULLISH';
  } else if (bearishScore > bullishScore * 1.3) {
    sentiment = 'BEARISH';
  }
  
  return { sentiment, score: confidence };
};

// Fetch from CryptoPanic (Free, no API key needed)
const fetchCryptoPanicNews = async (coinSymbol: string): Promise<NewsSource[]> => {
  const results: NewsSource[] = [];
  
  try {
    console.log(`Fetching from CryptoPanic for ${coinSymbol}`);
    const url = `https://cryptopanic.com/api/free/v1/posts/?auth_token=free&currencies=${coinSymbol.toUpperCase()}&public=true`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        for (const item of data.results.slice(0, 25)) {
          results.push({
            title: item.title || '',
            url: item.url || '',
            source: item.source?.title || 'CryptoPanic',
            date: item.created_at || new Date().toISOString(),
            snippet: item.title || ''
          });
        }
      }
    }
  } catch (error) {
    console.error('CryptoPanic error:', error);
  }
  
  return results;
};

// Fetch from Google News RSS (Free, no API key)
const fetchGoogleNewsRSS = async (coinName: string, coinSymbol: string): Promise<NewsSource[]> => {
  const results: NewsSource[] = [];
  
  try {
    console.log(`Fetching from Google News RSS for ${coinName}`);
    const query = encodeURIComponent(`${coinName} ${coinSymbol} cryptocurrency`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (response.ok) {
      const xmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      if (doc) {
        const items = doc.querySelectorAll('item');
        
        for (let i = 0; i < Math.min(items.length, 20); i++) {
          const item = items[i] as any;
          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          const description = item.querySelector('description')?.textContent || '';
          
          if (title && link) {
            results.push({
              title: title.substring(0, 200),
              url: link,
              source: 'Google News',
              date: pubDate,
              snippet: description.substring(0, 300)
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Google News RSS error:', error);
  }
  
  return results;
};

// Fetch crypto news from CoinDesk RSS (Free)
const fetchCoinDeskRSS = async (): Promise<NewsSource[]> => {
  const results: NewsSource[] = [];
  
  try {
    console.log('Fetching from CoinDesk RSS');
    const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (response.ok) {
      const xmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      if (doc) {
        const items = doc.querySelectorAll('item');
        
        for (let i = 0; i < Math.min(items.length, 15); i++) {
          const item = items[i] as any;
          const title = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          const description = item.querySelector('description')?.textContent || '';
          
          if (title && link) {
            results.push({
              title: title,
              url: link,
              source: 'CoinDesk',
              date: pubDate,
              snippet: description.substring(0, 300)
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('CoinDesk RSS error:', error);
  }
  
  return results;
};

// Filter news relevant to the specific coin
const filterRelevantNews = (news: NewsSource[], coinName: string, coinSymbol: string): NewsSource[] => {
  const keywords = [
    coinName.toLowerCase(),
    coinSymbol.toLowerCase(),
    `${coinSymbol.toLowerCase()}/usd`,
    `${coinSymbol.toLowerCase()}usd`
  ];
  
  return news.filter(item => {
    const searchText = (item.title + ' ' + item.snippet).toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  });
};

// Main search function combining all sources
const searchNews = async (coinName: string, coinSymbol: string): Promise<NewsSource[]> => {
  console.log(`Starting comprehensive news search for ${coinName} (${coinSymbol})`);
  
  const allResults: NewsSource[] = [];
  
  // Fetch from multiple free sources in parallel
  const [cryptoPanicResults, googleNewsResults, coinDeskResults] = await Promise.all([
    fetchCryptoPanicNews(coinSymbol),
    fetchGoogleNewsRSS(coinName, coinSymbol),
    fetchCoinDeskRSS()
  ]);
  
  console.log(`CryptoPanic: ${cryptoPanicResults.length} articles`);
  console.log(`Google News: ${googleNewsResults.length} articles`);
  console.log(`CoinDesk: ${coinDeskResults.length} articles`);
  
  // Add all results
  allResults.push(...cryptoPanicResults);
  allResults.push(...googleNewsResults);
  
  // Filter CoinDesk results to only include relevant ones
  const relevantCoinDesk = filterRelevantNews(coinDeskResults, coinName, coinSymbol);
  allResults.push(...relevantCoinDesk);
  
  // Remove duplicates based on URL
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.url, item])).values()
  );
  
  console.log(`Total unique articles found: ${uniqueResults.length}`);
  
  return uniqueResults;
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

    // Search for news from multiple free sources
    const newsResults = await searchNews(coinName, coinSymbol);
    
    if (newsResults.length === 0) {
      console.log('No news found, returning neutral sentiment');
      return new Response(JSON.stringify({
        overall: 'NEUTRAL',
        confidence: 50,
        signal: 'HOLD',
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        sources: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Analyzing ${newsResults.length} news items`);

    // Analyze sentiment for each news item with weighted scoring
    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;
    let totalSentimentScore = 0;
    let weightedBullishScore = 0;
    let weightedBearishScore = 0;

    for (const news of newsResults) {
      const fullText = news.title + ' ' + news.snippet;
      const analysis = analyzeSentiment(fullText);
      
      if (analysis.sentiment === 'BULLISH') {
        bullishCount++;
        weightedBullishScore += analysis.score;
      } else if (analysis.sentiment === 'BEARISH') {
        bearishCount++;
        weightedBearishScore += analysis.score;
      } else {
        neutralCount++;
      }
      
      totalSentimentScore += analysis.score;
    }

    // Calculate overall sentiment with sophisticated scoring
    const total = bullishCount + bearishCount + neutralCount;
    const bullishPercent = total > 0 ? (bullishCount / total) * 100 : 0;
    const bearishPercent = total > 0 ? (bearishCount / total) * 100 : 0;
    const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0;
    
    // Weight sentiment scores
    const avgBullishWeight = bullishCount > 0 ? weightedBullishScore / bullishCount : 0;
    const avgBearishWeight = bearishCount > 0 ? weightedBearishScore / bearishCount : 0;
    
    let overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;

    // Determine sentiment based on counts and weighted scores
    if (bullishPercent > 40 && avgBullishWeight > 0.5) {
      overall = 'BULLISH';
      signal = 'BUY';
      confidence = Math.min(95, Math.round(bullishPercent * (1 + avgBullishWeight) / 2));
    } else if (bearishPercent > 40 && avgBearishWeight > 0.5) {
      overall = 'BEARISH';
      signal = 'SELL';
      confidence = Math.min(95, Math.round(bearishPercent * (1 + avgBearishWeight) / 2));
    } else if (bullishPercent > bearishPercent && bullishPercent > 35) {
      overall = 'BULLISH';
      signal = 'BUY';
      confidence = Math.min(85, Math.round(bullishPercent + 10));
    } else if (bearishPercent > bullishPercent && bearishPercent > 35) {
      overall = 'BEARISH';
      signal = 'SELL';
      confidence = Math.min(85, Math.round(bearishPercent + 10));
    } else {
      overall = 'NEUTRAL';
      signal = 'HOLD';
      confidence = Math.max(50, Math.min(70, Math.round(neutralPercent + 20)));
    }
    
    console.log(`Sentiment Analysis - Bullish: ${bullishCount} (${bullishPercent.toFixed(1)}%), Bearish: ${bearishCount} (${bearishPercent.toFixed(1)}%), Neutral: ${neutralCount} (${neutralPercent.toFixed(1)}%)`);
    console.log(`Overall: ${overall}, Signal: ${signal}, Confidence: ${confidence}%`);

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
