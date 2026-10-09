# SEARCH-POI ENGINE v1 - Proprietary AI Search Architecture

Developed by POI FOUNDATION LTD | Nigeria

A sovereign AI-powered POI search engine with Intent-Context Synthesis and intelligent KV caching to reduce foreign API costs.

## Architecture

- **Frontend:** Vite + TypeScript + React + Tailwind (Deployed on Cloudflare Pages)
- **Backend:** Cloudflare Workers Functions at `/functions/api/*`
- **Data Layer:** Cloudflare KV (CACHE, API_KEYS) + D1 Database + R2 Bucket
- **Core Innovation:** Intent-Context Synthesis Engine for cost reduction and data sovereignty

## API Endpoints

- `/api/search` - Live POI search with intelligent cache
- `/api/gps` - Reverse geocoding
- `/api/time` - Server clock sync
- `/api/export` - JSON to CSV export
- `/api/generate-key` - Public API key generation

## Deployment

Build: `npm run build`
Output: `dist`
Infrastructure: Cloudflare Pages + Workers (Zero license fees, scales to 10k searches/month free tier)

## Proprietary Notice

This repository contains proprietary intellectual property of POI FOUNDATION LTD. All rights reserved. Exclusive acquisition available for African market.
