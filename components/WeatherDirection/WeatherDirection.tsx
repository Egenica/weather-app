import {
  WiDirectionDown,
  WiDirectionDownLeft,
  WiDirectionDownRight,
  WiDirectionLeft,
  WiDirectionRight,
  WiDirectionUp,
  WiDirectionUpLeft,
  WiDirectionUpRight,
} from 'weather-icons-react';

export const WindDirection = ({ direction, size }: { direction: string | undefined; size?: number }) => {
  //console.log('direction', direction);
  switch (direction) {
    case 'N':
      return <WiDirectionUp size={size} color="#fff" />;
    case 'NE':
      return <WiDirectionUpRight size={size} color="#fff" />;
    case 'NW':
      return <WiDirectionUpLeft size={size} color="#fff" />;
    case 'NNW':
      return <WiDirectionUpLeft size={size} color="#fff" />;
    case 'W':
      return <WiDirectionLeft size={size} color="#fff" />;
    case 'WNW':
      return <WiDirectionUpLeft size={size} color="#fff" />;
    case 'WSW':
      return <WiDirectionDownLeft size={size} color="#fff" />;
    case 'S':
      return <WiDirectionDown size={size} color="#fff" />;
    case 'SE':
      return <WiDirectionDownRight size={size} color="#fff" />;
    case 'SSE':
      return <WiDirectionDownRight size={size} color="#fff" />;
    case 'SW':
      return <WiDirectionDownLeft size={size} color="#fff" />;
    case 'SSW':
      return <WiDirectionDownLeft size={size} color="#fff" />;
    case 'E':
      return <WiDirectionRight size={size} color="#fff" />;
    case 'ENE':
      return <WiDirectionUpRight size={size} color="#fff" />;
    case 'ESE':
      return <WiDirectionDownRight size={size} color="#fff" />;
    default:
      return direction;
  }
};
