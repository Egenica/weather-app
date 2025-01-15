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
      return ['Clear night', WiNightClear, '/_f54531db-936a-4db3-9923-a9e1f25a37f6.jpeg'];
    case '1':
      return ['Sunny day', WiDaySunny, '/_49876d2a-adc0-4ce5-8bde-5fc833e0fce1.jpeg'];
    case '2':
      return ['Partly cloudy ', WiNightAltPartlyCloudy, '/_3edd4b9f-fb06-4757-a32f-bb1cfa01b9e0.jpeg'];
    case '3':
      return ['Partly cloudy ', WiDayCloudy, '/_b2f1cc4d-9302-4b45-a42c-359dcec5e64b.jpeg'];
    case '5':
      return ['Mist', WiFog, '/_8404a8b6-767a-4f0f-81d7-e689a4616267.jpeg'];
    case '6':
      return ['Fog', WiFog, '/_b8d9a3b1-c599-4c88-8681-c58af435e0d0.jpeg'];
    case '7':
      return ['Cloudy', WiCloudy, '/_d87a535f-3667-4d12-b1a2-3752f990eb4b.jpeg'];
    case '8':
      return ['Overcast', WiDaySunnyOvercast, '/_880b1745-c6b5-401c-8e6c-9d6f60df6053.jpeg'];
    case '9':
      return ['Light rain shower ', WiNightRainMix, '/_f6bf00fa-7142-4912-b36f-4d3d7f1eb9ad.jpeg'];
    case '10':
      return ['Light rain shower ', WiDayRainMix, '/_bc91bfa3-d2e7-4393-b168-1830ff98a317.jpeg'];
    case '11':
      return ['Drizzle', WiRainMix, '/_c8a35f78-4d55-4f40-b409-7de8a4ea244a.jpeg'];
    case '12':
      return ['Light rain', WiRainMix, '/_c8a35f78-4d55-4f40-b409-7de8a4ea244a.jpeg'];
    case '13':
      return ['Heavy rain shower ', WiNightAltRain, '/_7614a23d-23a4-41d4-a8db-303ed1144a1b.jpeg'];
    case '14':
      return ['Heavy rain shower ', WiDayRain, '/_4789eeb6-b545-4799-8605-d2a40666486d.jpeg'];
    case '15':
      return ['Heavy rain', WiRain, '/_b4a7eda0-a610-4e40-bf9e-7b17fbafe334.jpeg'];
    case '16':
      return ['Sleet shower ', WiNightAltSleet, '/_6d3f49ce-d11f-4b52-85ab-65d34384aa46.jpeg'];
    case '17':
      return ['Sleet shower ', WiDaySleet, '/_82f9771e-70a3-44e1-b969-dd86a95fbea8.jpeg'];
    case '18':
      return ['Sleet', WiSleet, '/_b1ba0af7-1a4f-4e50-9653-494e53b3d639.jpeg'];
    case '19':
      return ['Hail shower ', WiNightAltHail, '/_9f57a6ea-8f2f-439b-9568-af3023befb0d.jpeg'];
    case '20':
      return ['Hail shower ', WiDayHail, '/_3c81e0cb-fe0a-4470-b8ae-c5c66218763a.jpeg'];
    case '21':
      return ['Hail', WiHail, '/_da9c488b-07de-4f89-a2fe-29a3e9fa9426.jpeg'];
    case '22':
      return ['Light snow shower ', WiNightAltSnow, ''];
    case '23':
      return ['Light snow shower ', WiDaySnow, '/_ca970971-da6c-43b7-b46e-2eb65cc270d4.jpeg'];
    case '24':
      return ['Light snow', WiSnow, '/_2562ff75-e389-4564-b3ee-1b1c92fa302e.jpeg'];
    case '25':
      return ['Heavy snow shower', WiNightAltSnowWind, '_a046888a-1579-4400-8228-804fb79d6560.jpeg'];
    case '26':
      return ['Heavy snow shower', WiDaySnowWind, '/_99297b3d-8d00-4c52-8ea1-79b76e7f7800.jpeg'];
    case '27':
      return ['Heavy snow', WiSnowWind, '/_bcfcabcb-9e04-49da-92c8-2a4886ef1adf.jpeg'];
    case '28':
      return ['Thunder shower', WiNightAltThunderstorm, '/_11a28ff7-46b0-4586-8f0f-e1afdf59ef26.jpeg'];
    case '29':
      return ['Thunder shower', WiDayThunderstorm, '/_8c74aba7-ff99-428e-a471-eebfbd7319cf.jpeg'];
    case '30':
      return ['Thunder', WiThunderstorm, '/_38ddc299-f7a2-439c-992a-3e169e544cdb.jpeg'];
    default:
      return 'Unknown';
  }
};
