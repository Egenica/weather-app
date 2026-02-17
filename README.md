# Weather App - Met Office DataHub

Location-first weather app rebuilt for Met Office Weather DataHub.

Users search for a UK location, pick a result, and see current weather derived from the first timestep of the DataHub Global Spot hourly forecast.

## Stack

- Next.js + TypeScript + Tailwind
- Native `fetch` (Node 20)
- Backend route handlers for geocoding and weather
- Shared in-memory TTL cache (10 minutes)

## Environment Variables

Copy `.env.example` to `.env.local` and add:

```bash
METOFFICE_API_KEY=your-datahub-api-key
```

## DataHub Subscription Checklist

When creating your Met Office key, use the Weather DataHub docs category:

- `Site-specific` (this app uses point-based weather)

Use a subscription/plan that provides access to:

- `sitespecific/v0/point/hourly`

Do not use keys intended only for:

- `Atmospheric` (model grid/file products)
- `Observations` (observation product APIs)

Quick verify after adding your key:

1. Run `npm run dev`
2. Search a UK location in the app
3. Confirm weather loads from `GET /weather?lat=...&lon=...`

## Run Locally

```bash
npm i
npm run dev
```

Production build/start:

```bash
npm run build
npm run start
```

## API Endpoints

### `GET /api/geocode?q=<query>`

- Backend Open-Meteo geocoding (UK-only)
- Returns clickable location suggestions
- Empty query returns popular UK locations fallback list

Response shape:

```json
{
  "locations": [
    {
      "name": "Leeds",
      "adminArea": "England",
      "country": "United Kingdom",
      "lat": 53.8008,
      "lon": -1.5491
    }
  ]
}
```

### `GET /weather?lat=<number>&lon=<number>`

- Backend Met Office DataHub Global Spot (hourly + three-hourly)
- Uses first hourly timestep as "current weather"
- Uses three-hourly series for long-range day pages (up to 5 days)

Response shape:

```json
{
  "current": {
    "temperature": 5,
    "feelsLike": 3,
    "windSpeed": 12,
    "humidity": 88,
    "weatherCode": 7,
    "timestamp": "2026-02-16T11:00:00Z",
    "windDirection": "NW",
    "windGust": 20,
    "precipitationChance": 35,
    "visibility": 18000
  },
  "dailyPages": [
    {
      "date": "2026-02-16",
      "hours": [
        {
          "temperature": 5,
          "feelsLike": 3,
          "windSpeed": 12,
          "windGust": 20,
          "windDirection": "NW",
          "humidity": 88,
          "precipitationChance": 35,
          "visibility": 18000,
          "weatherCode": 7,
          "timestamp": "2026-02-16T11:00:00Z"
        }
      ]
    }
  ]
}
```

### `POST /api/background`

- Generates weather-aware background images using a free image generation endpoint
- Input fields: `locationName`, `country`, optional `adminArea`, optional `weatherCode`
- Response: `{ "imageUrl": "data:image/..." }`
- Server-side cache: 24 hours keyed by location + weather code

## Error Handling

- `400`: invalid input
- `502`: upstream provider failure
- `500`: internal/config error (for example missing `METOFFICE_API_KEY`)

## Caching

- Shared in-memory cache for both geocoding and weather
- TTL: 10 minutes
- Cache keys:
  - geocode: normalized query
  - weather: normalized lat/lon
