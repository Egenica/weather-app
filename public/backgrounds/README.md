Background image library for regional weather scenes.

Folder structure (recommended):

`/public/backgrounds/uk/<region>/<weather-condition>/<time-of-day>/v1.jpg`

Legacy structure (still supported):

`/public/backgrounds/<region>/<weather-condition>/<time-of-day>/v1.jpg`

Examples:

- `/public/backgrounds/uk/north-west-england/rain/day/v1.jpg`
- `/public/backgrounds/uk/scotland/heavy-snow/night/v1.jpg`
- `/public/backgrounds/uk/cloudy/day/v1.jpg` (global fallback)

Region slugs currently used by the app:

- `north-west-england`
- `north-east-england`
- `yorkshire-humber`
- `west-midlands`
- `east-midlands`
- `east-england`
- `greater-london`
- `south-east-england`
- `south-west-england`
- `scotland`
- `wales`
- `northern-ireland`
- `uk` (fallback)

Weather condition buckets currently used by the app:

- `clear`
- `partly-cloudy`
- `cloudy`
- `overcast`
- `mist-fog`
- `drizzle`
- `rain`
- `heavy-rain`
- `sleet`
- `hail`
- `light-snow`
- `heavy-snow`
- `thunderstorm`

Time of day:

- `day`
- `night`

Notes:

- The app now resolves backgrounds from local files only.
- External providers are disabled.
- To serve backgrounds from S3/CloudFront, set `BACKGROUND_ASSET_BASE_URL` (for example `https://cdn.example.com`).
- Upload this folder with AWS CLI: `aws s3 sync public/backgrounds s3://<bucket>/backgrounds --exclude ".gitkeep" --cache-control "public,max-age=31536000,immutable"`
