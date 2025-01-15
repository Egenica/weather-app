# Weather App - Using Met Office API (W.I.P)

A fun little weather app that uses all the modern frontend / backend frameworks with NextJs / Tailwind / Typescript.

### API Link

- https://www.metoffice.gov.uk/services/data/datapoint

### Run Dev

`npm run dev`

### Run Production

`npm run build`

`npm run start`

### Run Test

`npm run test`

## Features

- Location search.
- 5 day forcast by the Met Office data API.
- Uses NextJs / Typescript / Tailwind.
- Backend server API for data.
- Background changes depending on time of day and weather conditions.
- Location is saved in local storage.

## ToDo

- Tests need updating/adding to some sections.
- Currently, the 'Now at a glance' feature uses the first row of data, so it's not time-accurate unless it's in the morning. This was added as a "nice to have" feature but needs to be made time-accurate.
- The 'Now at a glance' feature should also change when the day is changed.
- It uses two API calls but might need to change to one, as it's potentially overly complicated by merging the two to display the time.
- More backgrounds need to be added for the counties. Currently, it displays various pictures of Yorkshire/Lancashire based on the quick view weather.
- Some wind direction icons might not be showing.
- Currently, the background can get stuck between viewing sessions; refreshing again fixes it, but this needs to be looked into (there's some kind of caching going on—it might be a local storage issue and needs investigation).
- There might be weather conditions where there are no icons, but I haven't seen that yet.
- Code test coverage needs to be added.
- Maybe the background should change based on the current day fade out old in new but could be a bit clunky - Might need to test locally.
- Background isn't updated if location is changed until page has manually been refreshed.
- I think the location Todmorden is the only location currently that has dynamic backgrounds so other locations will need to be added and backgrounds created. Microsoft AI image gen -> https://copilot.microsoft.com/images/create
