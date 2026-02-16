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

- Backend Met Office DataHub Global Spot hourly
- Uses first hourly timestep as "current weather"
- Always returns `timestamp` so UI can label data as `Forecast (hourly)`

Response shape:

```json
{
  "temperature": 5,
  "feelsLike": 3,
  "windSpeed": 12,
  "humidity": 88,
  "weatherCode": 7,
  "timestamp": "2026-02-16T11:00:00Z"
}
```

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
