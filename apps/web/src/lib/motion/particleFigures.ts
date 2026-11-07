/** Figuras tecnológicas hechas de partículas: geometría propia, compartida por la versión 3D y la 2D. */

export type FigureName =
  | "cpu"
  | "monitor"
  | "network"
  | "camera"
  | "browser"
  | "phone"
  | "gears"
  | "search"
  | "headset"
  | "chat";

/** Tipos de punto: el sombreador decide cómo se enciende cada uno. */
export const KIND = { body: 0, trace: 1, spark: 2, core: 3, bright: 4 } as const;

type Point = [number, number];
type Kind = (typeof KIND)[keyof typeof KIND];
interface Options {
  z?: number;
  kind?: Kind;
  /** Puntos por unidad de longitud o de superficie */
  density?: number;
}

const LINE_DENSITY = 210;
const AREA_DENSITY = 3600;

/** Inclinación de reposo de cada figura */
const TILT: Partial<Record<FigureName, { x: number; z: number; fit?: number }>> = {
  cpu: { x: -0.82, z: 0.6, fit: 0.84 },
  network: { x: -0.2, z: 0, fit: 0.86 },
  gears: { x: -0.45, z: 0.1 },
};

function createBuilder(budget: number) {
  const position: number[] = [];
  const kinds: number[] = [];
  const phases: number[] = [];

  const add = (x: number, y: number, z: number, kind: Kind, phase: number) => {
    position.push(x, y, z);
    kinds.push(kind);
    phases.push(phase);
  };

  /** Recorre tramos rectos: la fase crece a lo largo y por ahí viaja la chispa */
  const path = (
    points: Point[],
    { z = 0, kind = KIND.bright, density = LINE_DENSITY }: Options = {},
  ) => {
    let walked = Math.random();
    for (let i = 1; i < points.length; i += 1) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      const length = Math.hypot(x2 - x1, y2 - y1);
      const count = Math.ceil(length * density * budget);
      for (let n = 0; n < count; n += 1) {
        const t = n / count;
        const fuzz = () => (Math.random() - 0.5) * 0.012;
        add(
          x1 + (x2 - x1) * t + fuzz(),
          y1 + (y2 - y1) * t + fuzz(),
          z + fuzz(),
          kind,
          walked + length * t,
        );
      }
      walked += length;
    }
  };

  const rect = (x: number, y: number, w: number, h: number, options?: Options) => {
    const [l, r, b, t] = [x - w / 2, x + w / 2, y - h / 2, y + h / 2];
    path(
      [
        [l, b],
        [r, b],
        [r, t],
        [l, t],
        [l, b],
      ],
      options,
    );
  };

  const arc = (
    x: number,
    y: number,
    radius: number,
    from: number,
    to: number,
    options?: Options,
  ) => {
    const steps = Math.max(8, Math.ceil(Math.abs(to - from) * 24));
    const points: Point[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const angle = from + ((to - from) * i) / steps;
      points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]);
    }
    path(points, options);
  };

  const ring = (x: number, y: number, radius: number, options?: Options) =>
    arc(x, y, radius, 0, Math.PI * 2, options);

  /** Relleno en cuadrícula con holgura: se lee como puntos separados, no como mancha */
  const fill = (x: number, y: number, w: number, h: number, options: Options = {}) => {
    const { z = 0, kind = KIND.body, density = AREA_DENSITY } = options;
    const count = Math.ceil(w * h * density * budget);
    for (let i = 0; i < count; i += 1) {
      add(x + (Math.random() - 0.5) * w, y + (Math.random() - 0.5) * h, z, kind, Math.random() * 3);
    }
  };

  const disc = (x: number, y: number, radius: number, options: Options = {}) => {
    const { z = 0, kind = KIND.body, density = AREA_DENSITY } = options;
    const count = Math.ceil(Math.PI * radius * radius * density * budget);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius * Math.sqrt(Math.random());
      add(x + Math.cos(angle) * r, y + Math.sin(angle) * r, z, kind, r * 3);
    }
  };

  /** Chispas sueltas que flotan alrededor de la figura */
  const sparks = (count: number, spread = 1.3) => {
    for (let i = 0; i < count * budget; i += 1) {
      const x = (Math.random() - 0.5) * 2 * spread;
      const y = (Math.random() - 0.5) * 2 * spread;
      add(x, y, (Math.random() - 0.5) * 0.5, KIND.spark, Math.random());
    }
  };

  return { position, kinds, phases, path, rect, arc, ring, fill, disc, sparks };
}

type Builder = ReturnType<typeof createBuilder>;

/** Pista con codo que sale de un punto y termina en un nodo */
function trace(b: Builder, points: Point[], z = 0) {
  b.path(points, { z, kind: KIND.trace, density: 110 });
  const [x, y] = points[points.length - 1];
  b.disc(x, y, 0.024, { z, kind: KIND.bright, density: 14000 });
}

const FIGURES: Record<FigureName, (b: Builder) => void> = {
  cpu(b) {
    // Placa y encapsulado
    b.rect(0, 0, 1.24, 1.24);
    b.rect(0, 0, 1.15, 1.15, { z: 0.01, density: 90 });
    b.fill(0, 0, 1.2, 1.2, { density: 620 });
    // Núcleo elevado, con la N de Neolutions encendida
    b.rect(0, 0, 0.72, 0.72, { z: 0.16, kind: KIND.bright });
    b.fill(0, 0, 0.68, 0.68, { z: 0.16, kind: KIND.core, density: 3000 });
    b.path(
      [
        [-0.17, -0.2],
        [-0.17, 0.2],
        [0.17, -0.2],
        [0.17, 0.2],
      ],
      {
        z: 0.2,
        kind: KIND.bright,
        density: 900,
      },
    );
    // Patas y pistas en los cuatro lados
    const rotate = ([x, y]: Point, side: number): Point => {
      const angle = (side * Math.PI) / 2;
      const [c, s] = [Math.cos(angle), Math.sin(angle)];
      return [x * c - y * s, x * s + y * c];
    };
    for (let side = 0; side < 4; side += 1) {
      for (let i = 0; i < 9; i += 1) {
        const p = -0.52 + i * 0.13;
        const lean = p < -0.1 ? -1 : p > 0.1 ? 1 : 0;
        const reach = 0.86 + (i % 3) * 0.13;
        b.path([rotate([p, 0.62], side), rotate([p, 0.72], side)], {
          kind: KIND.bright,
          density: 320,
        });
        trace(
          b,
          [
            [p, 0.72],
            [p, 0.78],
            [p + lean * 0.12, 0.9],
            [p + lean * 0.12, reach + 0.12],
          ].map((point) => rotate(point as Point, side)),
        );
      }
    }
    b.sparks(420, 1.35);
  },

  monitor(b) {
    b.rect(0, 0.14, 1.9, 1.2);
    b.rect(0, 0.14, 1.78, 1.08, { z: 0.02, density: 80 });
    b.fill(0, 0.14, 1.76, 1.06, { density: 520 });
    b.path([
      [-0.2, -0.46],
      [-0.26, -0.78],
      [0.26, -0.78],
      [0.2, -0.46],
    ]);
    b.path(
      [
        [-0.5, -0.82],
        [0.5, -0.82],
      ],
      { kind: KIND.bright, density: 240 },
    );
    // Señal estable en la pantalla, con el visto bueno
    b.path(
      [
        [-0.74, 0.1],
        [-0.36, 0.1],
        [-0.26, 0.34],
        [-0.12, -0.14],
        [0.02, 0.1],
        [0.3, 0.1],
      ],
      {
        z: 0.08,
        kind: KIND.trace,
        density: 240,
      },
    );
    b.ring(0.54, 0.2, 0.2, { z: 0.08, kind: KIND.bright });
    b.path(
      [
        [0.45, 0.19],
        [0.52, 0.12],
        [0.65, 0.29],
      ],
      { z: 0.1, kind: KIND.bright, density: 320 },
    );
    b.sparks(260, 1.25);
  },

  network(b) {
    const nodes: Point[] = [
      [0, 0],
      [-0.92, 0.5],
      [0.92, 0.5],
      [-0.92, -0.5],
      [0.92, -0.5],
      [0, 0.92],
      [0, -0.92],
      [-1.5, 0],
      [1.5, 0],
    ];
    const links = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 5],
      [2, 5],
      [3, 6],
      [4, 6],
      [1, 7],
      [3, 7],
      [2, 8],
      [4, 8],
    ];
    links.forEach(([a, c]) => b.path([nodes[a], nodes[c]], { kind: KIND.trace, density: 120 }));
    nodes.forEach(([x, y], index) => {
      const radius = index === 0 ? 0.3 : 0.14;
      b.ring(x, y, radius, { z: 0.06, kind: KIND.bright, density: 300 });
      b.disc(x, y, radius * 0.86, { z: 0.06, kind: KIND.core, density: 6000 });
    });
    b.sparks(320, 1.6);
  },

  camera(b) {
    // Cuerpo alargado sobre su soporte
    b.rect(-0.1, 0.24, 1.5, 0.56);
    b.fill(-0.1, 0.24, 1.46, 0.52, { density: 900 });
    b.path([
      [0.65, 0.42],
      [0.92, 0.5],
      [0.92, -0.02],
      [0.65, 0.06],
    ]);
    b.ring(0.3, 0.24, 0.19, { z: 0.08, kind: KIND.bright });
    b.disc(0.3, 0.24, 0.1, { z: 0.08, kind: KIND.core, density: 12000 });
    b.path([
      [-0.42, -0.04],
      [-0.42, -0.34],
      [-0.82, -0.34],
      [-0.82, -0.86],
    ]);
    b.path(
      [
        [-1.1, -0.9],
        [-0.54, -0.9],
      ],
      { kind: KIND.bright, density: 240 },
    );
    // Cono de visión
    for (let i = 0; i < 6; i += 1) {
      const end = -0.1 + i * 0.28;
      b.path(
        [
          [0.3, 0.04],
          [0.02 + end * 0.7, -0.92],
        ],
        { z: 0.04, kind: KIND.trace, density: 70 },
      );
    }
    b.disc(0.86, 0.72, 0.035, { z: 0.08, kind: KIND.bright, density: 14000 });
    b.sparks(260, 1.25);
  },

  browser(b) {
    b.rect(0, 0, 2.2, 1.56);
    b.path([
      [-1.1, 0.5],
      [1.1, 0.5],
    ]);
    b.fill(0, -0.26, 2.14, 1.0, { density: 420 });
    [-0.98, -0.86, -0.74].forEach((x) =>
      b.disc(x, 0.64, 0.035, { kind: KIND.bright, density: 12000 }),
    );
    b.rect(0.2, 0.64, 1.4, 0.13, { density: 90 });
    // Bloques de la página
    b.rect(-0.54, 0.05, 0.86, 0.56, { z: 0.08, kind: KIND.bright });
    b.fill(-0.54, 0.05, 0.82, 0.52, { z: 0.08, kind: KIND.core, density: 3600 });
    [0.3, 0.14, -0.02, -0.18].forEach((y, index) =>
      b.path(
        [
          [0.14, y],
          [0.92 - index * 0.14, y],
        ],
        { z: 0.06, kind: KIND.trace, density: 150 },
      ),
    );
    [-0.86, -0.34, 0.18, 0.7].forEach((x) => b.rect(x + 0.1, -0.5, 0.42, 0.26, { z: 0.06 }));
    b.sparks(260, 1.4);
  },

  phone(b) {
    b.rect(0, 0, 0.96, 1.96);
    b.rect(0, 0, 0.86, 1.84, { z: 0.02, density: 80 });
    b.fill(0, 0, 0.84, 1.8, { density: 460 });
    b.path(
      [
        [-0.12, 0.84],
        [0.12, 0.84],
      ],
      { kind: KIND.bright, density: 260 },
    );
    b.rect(0, 0.42, 0.66, 0.5, { z: 0.08, kind: KIND.bright });
    b.fill(0, 0.42, 0.62, 0.46, { z: 0.08, kind: KIND.core, density: 3800 });
    [-0.02, -0.16, -0.3].forEach((y) =>
      b.path(
        [
          [-0.33, y],
          [0.33, y],
        ],
        { z: 0.06, kind: KIND.trace, density: 170 },
      ),
    );
    b.ring(0, -0.62, 0.13, { z: 0.08, kind: KIND.bright });
    trace(b, [
      [0.48, 0.2],
      [0.8, 0.2],
      [0.96, 0.36],
      [1.26, 0.36],
    ]);
    trace(b, [
      [-0.48, -0.2],
      [-0.8, -0.2],
      [-0.96, -0.36],
      [-1.26, -0.36],
    ]);
    b.sparks(240, 1.35);
  },

  gears(b) {
    const gear = (x: number, y: number, radius: number, teeth: number, turn: number) => {
      const points: Point[] = [];
      for (let i = 0; i <= teeth * 4; i += 1) {
        const angle = turn + (i / (teeth * 4)) * Math.PI * 2;
        const tall = i % 4 < 2;
        const r = tall ? radius : radius * 0.82;
        points.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
      }
      b.path(points, { kind: KIND.bright, density: 170 });
      b.ring(x, y, radius * 0.34, { z: 0.06, kind: KIND.bright });
      b.disc(x, y, radius * 0.72, { density: 760 });
      b.disc(x, y, radius * 0.26, { z: 0.06, kind: KIND.core, density: 7000 });
    };
    gear(-0.34, 0.2, 0.68, 12, 0);
    gear(0.72, -0.38, 0.46, 9, 0.2);
    trace(b, [
      [-0.92, -0.44],
      [-0.92, -0.86],
      [-0.5, -0.86],
      [-0.3, -1.04],
    ]);
    trace(b, [
      [0.72, 0.1],
      [0.72, 0.5],
      [1.04, 0.82],
    ]);
    b.sparks(280, 1.3);
  },

  search(b) {
    [0.34, 0.56, 0.84, 1.18].forEach((height, index) => {
      const x = -1.02 + index * 0.4;
      b.rect(x, -0.84 + height / 2, 0.26, height, { kind: KIND.bright });
      b.fill(x, -0.84 + height / 2, 0.22, height, { kind: KIND.core, density: 3000 });
    });
    b.path([
      [-1.3, -0.84],
      [1.3, -0.84],
    ]);
    b.ring(0.48, 0.3, 0.52, { z: 0.08, kind: KIND.bright, density: 240 });
    b.ring(0.48, 0.3, 0.44, { z: 0.08, density: 90 });
    b.disc(0.48, 0.3, 0.42, { z: 0.08, density: 520 });
    b.path(
      [
        [0.86, -0.08],
        [1.26, -0.5],
      ],
      { z: 0.08, kind: KIND.bright, density: 420 },
    );
    b.path(
      [
        [0.2, 0.18],
        [0.4, 0.34],
        [0.54, 0.22],
        [0.76, 0.46],
      ],
      {
        z: 0.1,
        kind: KIND.trace,
        density: 220,
      },
    );
    b.sparks(260, 1.35);
  },

  headset(b) {
    b.arc(0, 0.02, 0.92, 0.12, Math.PI - 0.12, { kind: KIND.bright, density: 210 });
    b.arc(0, 0.02, 0.8, 0.12, Math.PI - 0.12, { density: 110 });
    [-0.92, 0.92].forEach((x) => {
      b.rect(x, -0.2, 0.3, 0.62, { kind: KIND.bright });
      b.fill(x, -0.2, 0.26, 0.58, { kind: KIND.core, density: 3600 });
    });
    b.path(
      [
        [0.92, -0.52],
        [0.92, -0.74],
        [0.5, -0.92],
        [0.12, -0.92],
      ],
      { kind: KIND.trace, density: 170 },
    );
    b.disc(0.06, -0.92, 0.07, { kind: KIND.bright, density: 12000 });
    b.sparks(260, 1.3);
  },

  chat(b) {
    b.path(
      [
        [-1, 0.72],
        [1, 0.72],
        [1.14, 0.58],
        [1.14, -0.3],
        [1, -0.44],
        [-0.3, -0.44],
        [-0.68, -0.86],
        [-0.62, -0.44],
        [-1, -0.44],
        [-1.14, -0.3],
        [-1.14, 0.58],
        [-1, 0.72],
      ],
      { kind: KIND.bright, density: 170 },
    );
    b.fill(0, 0.14, 2.2, 1.1, { density: 440 });
    [-0.46, 0, 0.46].forEach((x) => {
      b.ring(x, 0.14, 0.15, { z: 0.08, kind: KIND.bright });
      b.disc(x, 0.14, 0.13, { z: 0.08, kind: KIND.core, density: 7000 });
    });
    b.sparks(260, 1.35);
  },
};

/** Devuelve los puntos de una figura. `budget` reduce la cantidad en equipos modestos. */
export function figurePoints(name: FigureName, budget = 1) {
  const builder = createBuilder(budget);
  FIGURES[name](builder);
  const count = builder.kinds.length;
  const position = Float32Array.from(builder.position);
  const start = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    seed[i] = Math.random();
    // Cada punto parte de una nube y viaja a su sitio al aparecer la figura
    start[i * 3] = position[i * 3] * (1.6 + Math.random()) + (Math.random() - 0.5) * 1.6;
    start[i * 3 + 1] = position[i * 3 + 1] * (1.6 + Math.random()) + (Math.random() - 0.5) * 1.6;
    start[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
  }
  return {
    count,
    position,
    start,
    seed,
    kind: Float32Array.from(builder.kinds),
    phase: Float32Array.from(builder.phases),
    tilt: TILT[name] ?? { x: -0.34, z: 0 },
  };
}

/** Figura que corresponde a cada servicio */
export const SERVICE_FIGURE: Record<string, FigureName> = {
  "soporte-tecnico": "monitor",
  "cableado-estructurado": "network",
  "camaras-de-seguridad": "camera",
  "paginas-web": "browser",
  "apps-moviles": "phone",
  "sistemas-y-automatizacion": "gears",
  "seo-y-sem": "search",
};
