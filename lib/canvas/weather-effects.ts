export type WeatherScene = 'clear' | 'partlyCloudy' | 'overcast' | 'fog' | 'rain' | 'sleet' | 'snow' | 'thunder';

type Particle = {
  alpha: number;
  drift: number;
  size: number;
  speed: number;
  x: number;
  y: number;
};

type Splash = {
  alpha: number;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type ColliderRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type Droplet = {
  alpha: number;
  radius: number;
  slideDelay: number;
  speed: number;
  trail: number;
  x: number;
  y: number;
};

type EngineOptions = {
  canvas: HTMLCanvasElement;
  intensity?: 'default' | 'storm';
  scene: WeatherScene;
  useHtmlInCanvas?: boolean;
};

export type EffectsMode = 'off' | 'on' | 'storm' | 'rain' | 'snow' | 'thunder';

type SceneConfig = {
  atmosphereAlpha: number;
  atmosphereBands: number;
  atmosphereDrift: number;
  cloudAlpha: number;
  cloudCount: number;
  cloudDrift: number;
  flashChance: number;
  fogAlpha: number;
  fogBands: number;
  particleAlpha: number;
  particleColor: string;
  particleCount: number;
  particleLength: number;
  particleSize: number;
  particleSpeed: number;
  tintAlpha: number;
  tintColor: string;
};

type SkyPalette = {
  bottom: string;
  top: string;
};

export function resolveSceneFromWeatherCode(weatherCode: number | null | undefined): WeatherScene {
  if (weatherCode === null || typeof weatherCode !== 'number') {
    return 'overcast';
  }

  if (weatherCode >= 28 && weatherCode <= 30) {
    return 'thunder';
  }
  if (weatherCode >= 22 && weatherCode <= 27) {
    return 'snow';
  }
  if (weatherCode >= 16 && weatherCode <= 21) {
    return 'sleet';
  }
  if (weatherCode >= 9 && weatherCode <= 15) {
    return 'rain';
  }
  if (weatherCode >= 5 && weatherCode <= 6) {
    return 'fog';
  }
  if (weatherCode >= 7 && weatherCode <= 8) {
    return 'overcast';
  }
  if (weatherCode >= 2 && weatherCode <= 3) {
    return 'partlyCloudy';
  }

  return 'clear';
}

export function isEffectsEnabled(search: string): boolean {
  return getEffectsMode(search) !== 'off';
}

export function getEffectsMode(search: string): EffectsMode {
  const params = new URLSearchParams(search);
  const mode = params.get('fx');

  if (mode === 'off') {
    return 'off';
  }

  if (mode === 'storm') {
    return 'storm';
  }

  if (mode === 'rain' || mode === 'snow' || mode === 'thunder') {
    return mode;
  }

  return 'on';
}

export function getDebugWeatherScene(search: string): WeatherScene | null {
  const mode = getEffectsMode(search);
  if (mode === 'rain' || mode === 'snow' || mode === 'thunder') {
    return mode;
  }

  return null;
}

export function isHtmlInCanvasRequested(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('hic') === '1' || params.get('htmlInCanvas') === '1';
}

function getSceneConfig(scene: WeatherScene): SceneConfig {
  switch (scene) {
    case 'clear':
      return {
        atmosphereAlpha: 0.025,
        atmosphereBands: 2,
        atmosphereDrift: 0.035,
        cloudAlpha: 0.02,
        cloudCount: 0,
        cloudDrift: 0.05,
        flashChance: 0,
        fogAlpha: 0.015,
        fogBands: 1,
        particleAlpha: 0,
        particleColor: 'rgba(255,255,255,0)',
        particleCount: 0,
        particleLength: 0,
        particleSize: 0,
        particleSpeed: 0,
        tintAlpha: 0.045,
        tintColor: '#f3c68e',
      };
    case 'partlyCloudy':
      return {
        atmosphereAlpha: 0.03,
        atmosphereBands: 2,
        atmosphereDrift: 0.04,
        cloudAlpha: 0.075,
        cloudCount: 0,
        cloudDrift: 0.08,
        flashChance: 0,
        fogAlpha: 0.025,
        fogBands: 2,
        particleAlpha: 0,
        particleColor: 'rgba(255,255,255,0)',
        particleCount: 0,
        particleLength: 0,
        particleSize: 0,
        particleSpeed: 0,
        tintAlpha: 0.06,
        tintColor: '#9ec0d7',
      };
    case 'overcast':
      return {
        atmosphereAlpha: 0.045,
        atmosphereBands: 3,
        atmosphereDrift: 0.05,
        cloudAlpha: 0.085,
        cloudCount: 0,
        cloudDrift: 0.07,
        flashChance: 0,
        fogAlpha: 0.03,
        fogBands: 2,
        particleAlpha: 0,
        particleColor: 'rgba(255,255,255,0)',
        particleCount: 0,
        particleLength: 0,
        particleSize: 0,
        particleSpeed: 0,
        tintAlpha: 0.095,
        tintColor: '#627388',
      };
    case 'fog':
      return {
        atmosphereAlpha: 0.06,
        atmosphereBands: 4,
        atmosphereDrift: 0.045,
        cloudAlpha: 0.06,
        cloudCount: 0,
        cloudDrift: 0.05,
        flashChance: 0,
        fogAlpha: 0.075,
        fogBands: 4,
        particleAlpha: 0,
        particleColor: 'rgba(255,255,255,0)',
        particleCount: 0,
        particleLength: 0,
        particleSize: 0,
        particleSpeed: 0,
        tintAlpha: 0.11,
        tintColor: '#97a4b1',
      };
    case 'rain':
      return {
        atmosphereAlpha: 0.012,
        atmosphereBands: 1,
        atmosphereDrift: 0.05,
        cloudAlpha: 0.09,
        cloudCount: 0,
        cloudDrift: 0.08,
        flashChance: 0,
        fogAlpha: 0.01,
        fogBands: 1,
        particleAlpha: 0.42,
        particleColor: 'rgba(210,230,255,0.9)',
        particleCount: 155,
        particleLength: 16,
        particleSize: 1,
        particleSpeed: 12,
        tintAlpha: 0.025,
        tintColor: '#4f6074',
      };
    case 'sleet':
      return {
        atmosphereAlpha: 0.06,
        atmosphereBands: 3,
        atmosphereDrift: 0.05,
        cloudAlpha: 0.1,
        cloudCount: 0,
        cloudDrift: 0.08,
        flashChance: 0,
        fogAlpha: 0.04,
        fogBands: 2,
        particleAlpha: 0.42,
        particleColor: 'rgba(230,240,255,0.95)',
        particleCount: 95,
        particleLength: 7,
        particleSize: 1.8,
        particleSpeed: 8,
        tintAlpha: 0.125,
        tintColor: '#647284',
      };
    case 'snow':
      return {
        atmosphereAlpha: 0.07,
        atmosphereBands: 4,
        atmosphereDrift: 0.04,
        cloudAlpha: 0.08,
        cloudCount: 0,
        cloudDrift: 0.05,
        flashChance: 0,
        fogAlpha: 0.045,
        fogBands: 3,
        particleAlpha: 0.5,
        particleColor: 'rgba(255,255,255,0.95)',
        particleCount: 80,
        particleLength: 0,
        particleSize: 2.2,
        particleSpeed: 2.2,
        tintAlpha: 0.11,
        tintColor: '#8a97a8',
      };
    case 'thunder':
      return {
        atmosphereAlpha: 0.07,
        atmosphereBands: 3,
        atmosphereDrift: 0.06,
        cloudAlpha: 0.12,
        cloudCount: 0,
        cloudDrift: 0.09,
        flashChance: 0.0012,
        fogAlpha: 0.04,
        fogBands: 2,
        particleAlpha: 0.46,
        particleColor: 'rgba(205,225,255,0.9)',
        particleCount: 175,
        particleLength: 19,
        particleSize: 1.1,
        particleSpeed: 14,
        tintAlpha: 0.16,
        tintColor: '#28313c',
      };
    default:
      return {
        atmosphereAlpha: 0,
        atmosphereBands: 0,
        atmosphereDrift: 0,
        cloudAlpha: 0,
        cloudCount: 0,
        cloudDrift: 0,
        flashChance: 0,
        fogAlpha: 0,
        fogBands: 0,
        particleAlpha: 0,
        particleColor: 'rgba(255,255,255,0)',
        particleCount: 0,
        particleLength: 0,
        particleSize: 0,
        particleSpeed: 0,
        tintAlpha: 0,
        tintColor: '#000000',
      };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getSkyPalette(scene: WeatherScene, daylightFactor: number): SkyPalette {
  const nightMix = 1 - daylightFactor;

  switch (scene) {
    case 'clear':
      return {
        top: `rgb(${Math.round(75 - nightMix * 35)}, ${Math.round(130 - nightMix * 70)}, ${Math.round(190 - nightMix * 95)})`,
        bottom: `rgb(${Math.round(145 - nightMix * 70)}, ${Math.round(185 - nightMix * 95)}, ${Math.round(220 - nightMix * 110)})`,
      };
    case 'partlyCloudy':
      return {
        top: `rgb(${Math.round(72 - nightMix * 30)}, ${Math.round(104 - nightMix * 55)}, ${Math.round(138 - nightMix * 75)})`,
        bottom: `rgb(${Math.round(120 - nightMix * 58)}, ${Math.round(144 - nightMix * 70)}, ${Math.round(166 - nightMix * 85)})`,
      };
    case 'overcast':
      return {
        top: `rgb(${Math.round(62 - nightMix * 22)}, ${Math.round(76 - nightMix * 30)}, ${Math.round(92 - nightMix * 35)})`,
        bottom: `rgb(${Math.round(95 - nightMix * 35)}, ${Math.round(108 - nightMix * 40)}, ${Math.round(122 - nightMix * 48)})`,
      };
    case 'fog':
      return {
        top: `rgb(${Math.round(86 - nightMix * 28)}, ${Math.round(99 - nightMix * 35)}, ${Math.round(112 - nightMix * 42)})`,
        bottom: `rgb(${Math.round(132 - nightMix * 55)}, ${Math.round(142 - nightMix * 58)}, ${Math.round(152 - nightMix * 62)})`,
      };
    case 'rain':
    case 'sleet':
    case 'thunder':
      return {
        top: `rgb(${Math.round(42 - nightMix * 12)}, ${Math.round(54 - nightMix * 16)}, ${Math.round(68 - nightMix * 18)})`,
        bottom: `rgb(${Math.round(74 - nightMix * 26)}, ${Math.round(88 - nightMix * 30)}, ${Math.round(103 - nightMix * 34)})`,
      };
    case 'snow':
      return {
        top: `rgb(${Math.round(90 - nightMix * 30)}, ${Math.round(104 - nightMix * 38)}, ${Math.round(119 - nightMix * 44)})`,
        bottom: `rgb(${Math.round(142 - nightMix * 56)}, ${Math.round(156 - nightMix * 62)}, ${Math.round(170 - nightMix * 72)})`,
      };
    default:
      return {
        top: 'rgb(60,74,90)',
        bottom: 'rgb(100,112,126)',
      };
  }
}

function getDaylightFactor(now: Date): number {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < 5 || hour > 21) {
    return 0;
  }
  if (hour < 8) {
    return (hour - 5) / 3;
  }
  if (hour > 18) {
    return (21 - hour) / 3;
  }
  return 1;
}

export function createWeatherEffectsEngine(options: EngineOptions) {
  const { canvas } = options;
  const context = canvas.getContext('2d');
  if (!context) {
    return {
      destroy: () => {},
      updateScene: (_scene: WeatherScene) => {},
    };
  }

  const state = {
    currentScene: options.scene,
    currentConfig: getSceneConfig(options.scene),
    flashStrength: 0,
    frame: 0,
    intensity: options.intensity ?? 'default',
    particleCap: 220,
    particles: [] as Particle[],
    colliders: [] as ColliderRect[],
    droplets: [] as Droplet[],
    rafId: 0,
    reducedMotion: false,
    running: true,
    splashes: [] as Splash[],
    targetConfig: getSceneConfig(options.scene),
    targetScene: options.scene,
    daylightFactor: getDaylightFactor(new Date()),
    htmlCollisionMaskReady: false,
    useHtmlInCanvas: options.useHtmlInCanvas ?? false,
  };

  const collisionMask = document.createElement('canvas');
  const collisionMaskContext = collisionMask.getContext('2d', { willReadFrequently: true });

  const getDrawElement = (targetContext: CanvasRenderingContext2D) => {
    const maybeContext = targetContext as CanvasRenderingContext2D & {
      drawElement?: (element: Element, x: number, y: number) => void | Promise<void>;
    };

    if (typeof maybeContext.drawElement === 'function') {
      return maybeContext.drawElement.bind(targetContext);
    }

    return null;
  };

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  state.reducedMotion = media.matches;

  const buildParticles = (config: SceneConfig) => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const count = Math.min(state.particleCap, Math.round((config.particleCount * width) / 1400));
    state.particles = new Array(Math.max(0, count)).fill(0).map(() => ({
      alpha: Math.random() * config.particleAlpha,
      drift: (Math.random() - 0.5) * 1.2,
      size: Math.max(0.8, config.particleSize * (0.65 + Math.random() * 0.8)),
      speed: config.particleSpeed * (0.7 + Math.random() * 0.7),
      x: Math.random() * width,
      y: Math.random() * height,
    }));
  };

  const updateColliders = () => {
    const canvasRect = canvas.getBoundingClientRect();
    const nodes = Array.from(document.querySelectorAll('[data-rain-collider="true"]'));
    state.colliders = nodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          bottom: rect.bottom - canvasRect.top,
          left: rect.left - canvasRect.left,
          right: rect.right - canvasRect.left,
          top: rect.top - canvasRect.top,
        };
      })
      .filter(
        (rect) =>
          rect.top > 56 &&
          rect.right > 0 &&
          rect.left < canvas.clientWidth &&
          rect.bottom > 0 &&
          rect.top < canvas.clientHeight,
      );

    state.htmlCollisionMaskReady = false;
    if (!state.useHtmlInCanvas || !collisionMaskContext) {
      return;
    }

    const drawElement = getDrawElement(collisionMaskContext);
    if (!drawElement) {
      return;
    }

    collisionMask.width = Math.max(1, Math.round(canvas.clientWidth));
    collisionMask.height = Math.max(1, Math.round(canvas.clientHeight));
    collisionMaskContext.clearRect(0, 0, collisionMask.width, collisionMask.height);

    const drawTasks = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      return drawElement(node, x, y);
    });

    Promise.resolve(Promise.all(drawTasks)).then(
      () => {
        state.htmlCollisionMaskReady = true;
        if (window.localStorage.getItem('fxDebug') === 'true') {
          console.log('[weather-fx] html-in-canvas collision mask enabled');
        }
      },
      () => {
        state.htmlCollisionMaskReady = false;
        if (window.localStorage.getItem('fxDebug') === 'true') {
          console.log('[weather-fx] html-in-canvas collision mask failed; using rect fallback');
        }
      },
    );
  };

  const getMaskAlpha = (x: number, y: number): number => {
    if (!collisionMaskContext || !state.htmlCollisionMaskReady) {
      return 0;
    }

    if (x < 0 || y < 0 || x >= collisionMask.width || y >= collisionMask.height) {
      return 0;
    }

    return collisionMaskContext.getImageData(Math.round(x), Math.round(y), 1, 1).data[3];
  };

  const createSplash = (x: number, y: number, magnitude: number) => {
    for (let i = 0; i < 3; i += 1) {
      state.splashes.push({
        alpha: 0.35 + Math.random() * 0.3,
        radius: 0.8 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1.2 - Math.random() * 1.5,
        x: x + (Math.random() - 0.5) * 5,
        y,
      });
    }

    if (state.splashes.length > magnitude) {
      state.splashes.splice(0, state.splashes.length - magnitude);
    }
  };

  const createDroplet = (x: number, y: number) => {
    if (y < 64 || Math.random() > 0.1) {
      return;
    }

    state.droplets.push({
      alpha: 0.16 + Math.random() * 0.18,
      radius: 0.65 + Math.random() * 1.2,
      slideDelay: 8 + Math.random() * 42,
      speed: 0.14 + Math.random() * 0.42,
      trail: 4 + Math.random() * 12,
      x: x + (Math.random() - 0.5) * 8,
      y: y + 1 + Math.random() * 4,
    });

    if (state.droplets.length > 55) {
      state.droplets.splice(0, state.droplets.length - 55);
    }
  };

  const resize = () => {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles(state.currentConfig);
    updateColliders();
  };

  const drawTint = (config: SceneConfig) => {
    if (config.tintAlpha <= 0) {
      return;
    }

    const nightBoost = 1 + (1 - state.daylightFactor) * 0.45;
    context.fillStyle = config.tintColor;
    context.globalAlpha = Math.min(0.22, config.tintAlpha * nightBoost);
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    context.globalAlpha = 1;
  };

  const drawSkyBackdrop = (scene: WeatherScene, elapsed: number) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const palette = getSkyPalette(scene, state.daylightFactor);
    const backdropAlpha = scene === 'rain' ? 0.035 : 0.28;
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette.top);
    sky.addColorStop(1, palette.bottom);
    context.fillStyle = sky;
    context.globalAlpha = backdropAlpha;
    context.fillRect(0, 0, width, height);

    if (scene === 'partlyCloudy' || scene === 'overcast' || scene === 'fog') {
      const coverStrength = scene === 'overcast' ? 0.2 : scene === 'fog' ? 0.16 : 0.12;
      for (let i = 0; i < 3; i += 1) {
        const radius = width * (0.45 + i * 0.12);
        const x = ((elapsed * 0.04 + i * width * 0.35) % (width + radius * 2)) - radius;
        const y = height * (0.2 + i * 0.12);
        const cloud = context.createRadialGradient(x, y, radius * 0.1, x, y, radius);
        cloud.addColorStop(0, `rgba(235,240,245,${coverStrength})`);
        cloud.addColorStop(1, 'rgba(235,240,245,0)');
        context.fillStyle = cloud;
        context.fillRect(0, 0, width, height);
      }
    }

    context.globalAlpha = 1;
  };

  const drawAtmosphere = (config: SceneConfig, elapsed: number) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    for (let i = 0; i < config.atmosphereBands; i += 1) {
      const y = height * (0.18 + i * 0.15) + Math.sin(elapsed * 0.0012 + i) * 10;
      const bandHeight = 95 + i * 20;
      const driftX = Math.sin(elapsed * config.atmosphereDrift * 0.01 + i * 1.4) * 45;
      const gradient = context.createLinearGradient(0, y, 0, y + bandHeight);
      const alpha = Math.max(0, config.atmosphereAlpha * (0.9 - i * 0.14) * (0.85 + (1 - state.daylightFactor) * 0.2));

      gradient.addColorStop(0, 'rgba(220,230,240,0)');
      gradient.addColorStop(0.5, `rgba(220,230,240,${alpha})`);
      gradient.addColorStop(1, 'rgba(220,230,240,0)');
      context.fillStyle = gradient;
      context.fillRect(-60 + driftX, y, width + 120, bandHeight);
    }
  };

  const drawClouds = (config: SceneConfig, elapsed: number) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    for (let i = 0; i < config.cloudCount; i += 1) {
      const radiusX = 180 + i * 42;
      const radiusY = radiusX * 0.22;
      const y = height * 0.16 + i * 58 + Math.sin(elapsed * 0.0012 + i) * 8;
      const drift = ((elapsed * config.cloudDrift + i * 170) % (width + radiusX * 2)) - radiusX;
      const gradient = context.createRadialGradient(drift, y, radiusX * 0.15, drift, y, radiusX);
      const shade = 245 - Math.round((1 - state.daylightFactor) * 55);
      gradient.addColorStop(0, `rgba(${shade},${shade},${shade},${config.cloudAlpha * 0.55})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(drift, y, radiusX, radiusY, 0, 0, Math.PI * 2);
      context.fill();
    }
  };

  const drawFog = (config: SceneConfig, elapsed: number) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    for (let i = 0; i < config.fogBands; i += 1) {
      const bandHeight = 45 + i * 12;
      const y = height * 0.35 + i * 70 + Math.sin(elapsed * 0.0015 + i) * 18;
      const xShift = Math.sin(elapsed * 0.0008 + i * 2) * 24;
      const fog = context.createLinearGradient(0, y, 0, y + bandHeight);
      const alpha = config.fogAlpha * (0.9 - i * 0.14) * (0.9 + (1 - state.daylightFactor) * 0.15);
      fog.addColorStop(0, 'rgba(230,235,245,0)');
      fog.addColorStop(0.5, `rgba(230,235,245,${Math.max(alpha, 0)})`);
      fog.addColorStop(1, 'rgba(230,235,245,0)');
      context.fillStyle = fog;
      context.fillRect(-30 + xShift, y, width + 60, bandHeight);
    }
  };

  const drawParticles = (config: SceneConfig) => {
    if (state.particles.length === 0) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.strokeStyle = config.particleColor;
    context.fillStyle = config.particleColor;
    context.lineWidth = 1;

    for (let i = 0; i < state.particles.length; i += 1) {
      const particle = state.particles[i];
      const drift = particle.drift * (config.particleLength > 0 ? 1.8 : 0.8);

      const nextX = particle.x + drift;
      const nextY = particle.y + particle.speed;

      let collided = false;
      if (config.particleLength > 0 && state.htmlCollisionMaskReady) {
        const alpha = getMaskAlpha(nextX, nextY);
        if (alpha > 12 && Math.random() < 0.55) {
          createSplash(nextX, nextY, 320);
          createDroplet(nextX, nextY);
          particle.y = -10;
          particle.x = Math.random() * width;
          collided = true;
        }
      }

      if (!collided && config.particleLength > 0 && state.colliders.length > 0) {
        for (let j = 0; j < state.colliders.length; j += 1) {
          const rect = state.colliders[j];
          const isWithinHorizontal = nextX >= rect.left && nextX <= rect.right;
          const crossesTop = particle.y <= rect.top && nextY >= rect.top;
          if (isWithinHorizontal && crossesTop) {
            createSplash(nextX, rect.top, 260);
            createDroplet(nextX, rect.top);
            particle.y = -10;
            particle.x = Math.random() * width;
            collided = true;
            break;
          }
        }
      }

      if (collided) {
        continue;
      }

      particle.x = nextX;
      particle.y = nextY;

      if (particle.y > height + 10) {
        particle.y = -10;
        particle.x = Math.random() * width;
      }
      if (particle.x > width + 15) {
        particle.x = -15;
      } else if (particle.x < -15) {
        particle.x = width + 15;
      }

      if (config.particleLength > 0) {
        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - drift * 2.6, particle.y - config.particleLength);
        context.stroke();
      } else {
        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalAlpha = 1;
  };

  const drawSplashes = (config: SceneConfig) => {
    if (config.particleLength <= 0 || state.splashes.length === 0) {
      return;
    }

    for (let i = state.splashes.length - 1; i >= 0; i -= 1) {
      const splash = state.splashes[i];
      splash.x += splash.vx;
      splash.y += splash.vy;
      splash.vy += 0.09;
      splash.alpha *= 0.93;

      if (splash.alpha < 0.02) {
        state.splashes.splice(i, 1);
        continue;
      }

      context.globalAlpha = splash.alpha;
      context.fillStyle = config.particleColor;
      context.beginPath();
      context.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
  };

  const drawDroplets = (config: SceneConfig) => {
    if (config.particleLength <= 0 || state.droplets.length === 0) {
      return;
    }

    for (let i = state.droplets.length - 1; i >= 0; i -= 1) {
      const droplet = state.droplets[i];
      if (droplet.slideDelay > 0) {
        droplet.slideDelay -= 1;
      } else {
        droplet.y += droplet.speed;
        droplet.trail = Math.min(28, droplet.trail + droplet.speed * 0.7);
      }

      droplet.alpha *= 0.988;
      if (droplet.alpha < 0.035 || droplet.y > canvas.clientHeight + 30) {
        state.droplets.splice(i, 1);
        continue;
      }

      const trail = context.createLinearGradient(droplet.x, droplet.y - droplet.trail, droplet.x, droplet.y + 2);
      trail.addColorStop(0, 'rgba(210,230,255,0)');
      trail.addColorStop(1, `rgba(210,230,255,${droplet.alpha * 0.34})`);
      context.strokeStyle = trail;
      context.lineWidth = Math.max(0.8, droplet.radius * 0.7);
      context.beginPath();
      context.moveTo(droplet.x, droplet.y - droplet.trail);
      context.lineTo(droplet.x, droplet.y);
      context.stroke();

      const bead = context.createRadialGradient(
        droplet.x - droplet.radius * 0.25,
        droplet.y - droplet.radius * 0.25,
        0,
        droplet.x,
        droplet.y,
        droplet.radius * 2.2,
      );
      bead.addColorStop(0, `rgba(255,255,255,${droplet.alpha * 0.9})`);
      bead.addColorStop(0.45, `rgba(210,230,255,${droplet.alpha * 0.45})`);
      bead.addColorStop(1, 'rgba(210,230,255,0)');
      context.fillStyle = bead;
      context.beginPath();
      context.arc(droplet.x, droplet.y, droplet.radius * 1.8, 0, Math.PI * 2);
      context.fill();
    }
  };

  const drawLightning = (config: SceneConfig) => {
    if (config.flashChance <= 0) {
      return;
    }

    const flashChance = state.intensity === 'storm' ? config.flashChance * 2.6 : config.flashChance;
    if (Math.random() < flashChance) {
      state.flashStrength = state.intensity === 'storm' ? 0.34 : 0.22;
    }

    if (state.flashStrength <= 0.001) {
      return;
    }

    state.flashStrength *= 0.88;
    context.fillStyle = `rgba(240,245,255,${state.flashStrength})`;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  };

  const interpolateConfig = () => {
    const current = state.currentConfig;
    const target = state.targetConfig;
    const amount = 0.08;

      current.atmosphereAlpha += (target.atmosphereAlpha - current.atmosphereAlpha) * amount;
      current.atmosphereBands = Math.round(current.atmosphereBands + (target.atmosphereBands - current.atmosphereBands) * amount);
      current.atmosphereDrift += (target.atmosphereDrift - current.atmosphereDrift) * amount;
      current.cloudAlpha += (target.cloudAlpha - current.cloudAlpha) * amount;
    current.cloudCount = Math.round(current.cloudCount + (target.cloudCount - current.cloudCount) * amount);
    current.cloudDrift += (target.cloudDrift - current.cloudDrift) * amount;
    current.flashChance += (target.flashChance - current.flashChance) * amount;
    current.fogAlpha += (target.fogAlpha - current.fogAlpha) * amount;
    current.fogBands = Math.round(current.fogBands + (target.fogBands - current.fogBands) * amount);
    current.particleAlpha += (target.particleAlpha - current.particleAlpha) * amount;
    current.particleCount = Math.round(current.particleCount + (target.particleCount - current.particleCount) * amount);
      current.particleLength += (target.particleLength - current.particleLength) * amount;
      current.particleSize += (target.particleSize - current.particleSize) * amount;
      current.particleSpeed += (target.particleSpeed - current.particleSpeed) * amount;
      current.particleColor = target.particleColor;
      current.tintAlpha += (target.tintAlpha - current.tintAlpha) * amount;
      current.tintColor = target.tintColor;
  };

  const animate = () => {
    if (!state.running) {
      return;
    }

    if (document.visibilityState !== 'visible') {
      state.rafId = window.requestAnimationFrame(animate);
      return;
    }

    interpolateConfig();

    const elapsed = state.frame;
    state.frame += 1;
    if (state.frame % 180 === 0) {
      state.daylightFactor = getDaylightFactor(new Date());
    }
    if (state.frame % 30 === 0) {
      updateColliders();
    }

    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    drawSkyBackdrop(state.targetScene, elapsed);
    drawTint(state.currentConfig);
    drawAtmosphere(state.currentConfig, elapsed);
    drawClouds(state.currentConfig, elapsed);
    drawFog(state.currentConfig, elapsed);
    drawParticles(state.currentConfig);
    drawSplashes(state.currentConfig);
    drawDroplets(state.currentConfig);
    drawLightning(state.currentConfig);

    state.rafId = window.requestAnimationFrame(animate);
  };

  const renderStaticFrame = () => {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawSkyBackdrop(state.targetScene, 0);
    drawTint(state.currentConfig);
    drawAtmosphere(state.currentConfig, 0);
    drawClouds(state.currentConfig, 0);
    drawFog(state.currentConfig, 0);
    drawParticles(state.currentConfig);
    drawSplashes(state.currentConfig);
    drawDroplets(state.currentConfig);
  };

  const handleMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => {
    state.reducedMotion = event.matches;
    if (state.reducedMotion) {
      window.cancelAnimationFrame(state.rafId);
      renderStaticFrame();
      return;
    }
    animate();
  };

  const handleResize = () => {
    resize();
    if (state.reducedMotion) {
      renderStaticFrame();
    }
  };

  resize();
  updateColliders();
  if (state.reducedMotion) {
    renderStaticFrame();
  } else {
    animate();
  }

  media.addEventListener('change', handleMotionPreference);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', updateColliders, { passive: true });

  return {
    destroy: () => {
      state.running = false;
      window.cancelAnimationFrame(state.rafId);
      media.removeEventListener('change', handleMotionPreference);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateColliders);
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    },
    updateScene: (scene: WeatherScene) => {
      if (scene === state.targetScene) {
        return;
      }

      state.targetScene = scene;
      state.targetConfig = getSceneConfig(scene);
      buildParticles(state.targetConfig);
    },
  };
}
