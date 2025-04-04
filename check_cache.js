// Simple script to check the current state of the project cache
import express from 'express';
import { _projectCache, getProjectMarketData } from './server/cache.js';

const app = express();
const port = 3001;

app.get('/dump-cache', (req, res) => {
  const cacheEntries = {};
  
  // Loop through all entries in the project cache
  for (const [projectId, cacheEntry] of _projectCache.entries()) {
    cacheEntries[projectId] = {
      lastUpdated: cacheEntry.lastUpdated,
      marketData: cacheEntry.marketData,
      tokenHolders: {
        count: cacheEntry.tokenHolders.holders.length
      },
      apiSuccess: cacheEntry.apiSuccess,
      isNew: cacheEntry.isNew
    };
  }
  
  res.json({
    cacheEntries,
    cacheSize: _projectCache.size
  });
});

app.listen(port, () => {
  console.log(`Cache dump server running on port ${port}`);
});