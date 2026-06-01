import {
  getDebugWeatherScene,
  getEffectsMode,
  isEffectsEnabled,
  isHtmlInCanvasRequested,
  resolveSceneFromWeatherCode,
} from './weather-effects';

describe('resolveSceneFromWeatherCode', () => {
  it('maps clear codes', () => {
    expect(resolveSceneFromWeatherCode(0)).toBe('clear');
    expect(resolveSceneFromWeatherCode(1)).toBe('clear');
  });

  it('maps cloudy families and fog codes', () => {
    expect(resolveSceneFromWeatherCode(2)).toBe('partlyCloudy');
    expect(resolveSceneFromWeatherCode(3)).toBe('partlyCloudy');
    expect(resolveSceneFromWeatherCode(5)).toBe('fog');
    expect(resolveSceneFromWeatherCode(7)).toBe('overcast');
    expect(resolveSceneFromWeatherCode(8)).toBe('overcast');
  });

  it('maps precipitation classes', () => {
    expect(resolveSceneFromWeatherCode(10)).toBe('rain');
    expect(resolveSceneFromWeatherCode(18)).toBe('sleet');
    expect(resolveSceneFromWeatherCode(24)).toBe('snow');
    expect(resolveSceneFromWeatherCode(29)).toBe('thunder');
  });

  it('falls back safely for unknown values', () => {
    expect(resolveSceneFromWeatherCode(null)).toBe('overcast');
    expect(resolveSceneFromWeatherCode(undefined)).toBe('overcast');
    expect(resolveSceneFromWeatherCode(900)).toBe('clear');
  });
});

describe('isEffectsEnabled', () => {
  it('disables effects when fx is off', () => {
    expect(isEffectsEnabled('?fx=off')).toBe(false);
  });

  it('enables effects by default and for debug modes', () => {
    expect(isEffectsEnabled('')).toBe(true);
    expect(isEffectsEnabled('?fx=on')).toBe(true);
    expect(isEffectsEnabled('?fx=storm')).toBe(true);
    expect(isEffectsEnabled('?fx=rain')).toBe(true);
  });
});

describe('getEffectsMode', () => {
  it('resolves explicit modes correctly', () => {
    expect(getEffectsMode('?fx=off')).toBe('off');
    expect(getEffectsMode('?fx=storm')).toBe('storm');
    expect(getEffectsMode('?fx=rain')).toBe('rain');
    expect(getEffectsMode('?fx=snow')).toBe('snow');
    expect(getEffectsMode('?fx=thunder')).toBe('thunder');
    expect(getEffectsMode('?fx=on')).toBe('on');
  });

  it('defaults to on when query is missing or unknown', () => {
    expect(getEffectsMode('')).toBe('on');
    expect(getEffectsMode('?fx=unknown')).toBe('on');
  });
});

describe('getDebugWeatherScene', () => {
  it('forces testable weather scenes from query params', () => {
    expect(getDebugWeatherScene('?fx=rain')).toBe('rain');
    expect(getDebugWeatherScene('?fx=snow')).toBe('snow');
    expect(getDebugWeatherScene('?fx=thunder')).toBe('thunder');
  });

  it('does not override normal modes', () => {
    expect(getDebugWeatherScene('')).toBeNull();
    expect(getDebugWeatherScene('?fx=on')).toBeNull();
    expect(getDebugWeatherScene('?fx=storm')).toBeNull();
  });
});

describe('isHtmlInCanvasRequested', () => {
  it('enables the experimental path only when explicitly requested', () => {
    expect(isHtmlInCanvasRequested('?hic=1')).toBe(true);
    expect(isHtmlInCanvasRequested('?htmlInCanvas=1')).toBe(true);
    expect(isHtmlInCanvasRequested('')).toBe(false);
    expect(isHtmlInCanvasRequested('?hic=0')).toBe(false);
  });
});
