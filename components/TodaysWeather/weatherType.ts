import {
  WiCloudy,
  WiDayCloudy,
  WiDayHail,
  WiDayRain,
  WiDayRainMix,
  WiDaySleet,
  WiDaySnow,
  WiDaySnowWind,
  WiDaySunny,
  WiDaySunnyOvercast,
  WiDayThunderstorm,
  WiFog,
  WiHail,
  WiNightAltHail,
  WiNightAltPartlyCloudy,
  WiNightAltRain,
  WiNightAltSleet,
  WiNightAltSnow,
  WiNightAltSnowWind,
  WiNightAltThunderstorm,
  WiNightClear,
  WiNightRainMix,
  WiRain,
  WiRainMix,
  WiSleet,
  WiSnow,
  WiSnowWind, //WiStrongWind,
  WiThunderstorm, //WiWindy,
} from 'weather-icons-react';

export const weatherType = (weatherNow: string) => {
  //console.log('weatherNow', weatherNow);
  switch (weatherNow) {
    case '0':
      return ['Clear night', WiNightClear];
    case '1':
      return ['Sunny day', WiDaySunny];
    case '2':
      return ['Partly cloudy (night)', WiNightAltPartlyCloudy];
    case '3':
      return ['Partly cloudy (day)', WiDayCloudy];
    case '5':
      return ['Mist', WiFog];
    case '6':
      return ['Fog', WiFog];
    case '7':
      return ['Cloudy', WiCloudy];
    case '8':
      return ['Overcast', WiDaySunnyOvercast];
    case '9':
      return ['Light rain shower (night)', WiNightRainMix];
    case '10':
      return ['Light rain shower (day)', WiDayRainMix];
    case '11':
      return ['Drizzle', WiRainMix];
    case '12':
      return ['Light rain', WiRainMix];
    case '13':
      return ['Heavy rain shower (night)', WiNightAltRain];
    case '14':
      return ['Heavy rain shower (day)', WiDayRain];
    case '15':
      return ['Heavy rain', WiRain];
    case '16':
      return ['Sleet shower (night)', WiNightAltSleet];
    case '17':
      return ['Sleet shower (day)', WiDaySleet];
    case '18':
      return ['Sleet', WiSleet];
    case '19':
      return ['Hail shower (night)', WiNightAltHail];
    case '20':
      return ['Hail shower (day)', WiDayHail];
    case '21':
      return ['Hail', WiHail];
    case '22':
      return ['Light snow shower (night)', WiNightAltSnow];
    case '23':
      return ['Light snow shower (day)', WiDaySnow];
    case '24':
      return ['Light snow', WiSnow];
    case '25':
      return ['Heavy snow shower (night)', WiNightAltSnowWind];
    case '26':
      return ['Heavy snow shower (day)', WiDaySnowWind];
    case '27':
      return ['Heavy snow', WiSnowWind];
    case '28':
      return ['Thunder shower (night)', WiNightAltThunderstorm];
    case '29':
      return ['Thunder shower (day)', WiDayThunderstorm];
    case '30':
      return ['Thunder', WiThunderstorm];
    default:
      return 'Unknown';
  }
};
