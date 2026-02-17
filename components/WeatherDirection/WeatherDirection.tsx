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

const COMPASS_POINTS = [
  'NNE',
  'ENE',
  'ESE',
  'SSE',
  'SSW',
  'WSW',
  'WNW',
  'NNW',
  'NE',
  'NW',
  'SE',
  'SW',
  'N',
  'E',
  'S',
  'W',
] as const;

function normalizeDirection(direction: string | undefined): string | null {
  if (!direction) {
    return null;
  }

  const cleaned = direction.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleaned) {
    return null;
  }

  if ((COMPASS_POINTS as readonly string[]).includes(cleaned)) {
    return cleaned;
  }

  if (cleaned.length % 2 === 0) {
    const half = cleaned.slice(0, cleaned.length / 2);
    if (half === cleaned.slice(cleaned.length / 2) && (COMPASS_POINTS as readonly string[]).includes(half)) {
      return half;
    }
  }

  const match = COMPASS_POINTS.find((point) => cleaned.includes(point));
  return match ?? null;
}

export const WindDirection = ({ direction, size }: { direction: string | undefined; size?: number }) => {
  const normalizedDirection = normalizeDirection(direction);

  switch (normalizedDirection) {
    case 'N':
      return <WiDirectionUp size={size} color="#fff" />;
    case 'NE':
      return <WiDirectionUpRight size={size} color="#fff" />;
    case 'NNE':
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
      return null;
  }
};
