# Weather App - Using Met Office API (W.I.P)

API Link

- https://www.metoffice.gov.uk/services/data/datapoint

Run Dev

`npm run dev`

Run Production

`npm run build`

`npm run start`

Run Test

`npm run test`

# Features

- Location search
- 5 day forcast by the Met Office data API
- Uses NextJs / Typescript / Tailwind
- Backend server API for data
- Background changes depending on time of day and weather conditions
- Location is saved in local storage for

# ToDo

- Tests need updating / adding to some sections
- Currently the 'Now at a glance' uses the first row of data so its not time accurate (unless it's in the morning - this was added as a nice to have and needs to be time accurate)
- The 'Now at a glance' should also change when the day is changed
- Uses two api calls but might needs to change to one as it's potentially overyly complicated as merges the two to display the time
- More backgrounds need adding for the counties currently it displays various pictures of yorkshire / lancs based on the quick view weather
- Some wind direction icons might not be showing
- Currently the background can get stuck between viewing sessions and refreshin again fixes it but needs look into (there's some kind of caching going on, it might be a local storage issue, needs investigating)
- There might be weather conditions where the there are no icons but I havent seen that yet
- Code test coverage needs adding
