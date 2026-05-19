import React from 'react';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

type GradientStop = { offset: number; color: string; opacity?: number };

type LinearLayer = {
  kind: 'linear';
  // Unit-square coordinates (0..1), mapped to width/height at render time.
  from: [number, number];
  to: [number, number];
  stops: GradientStop[];
  blendOpacity?: number;
};

type RadialLayer = {
  kind: 'radial';
  center: [number, number]; // unit square
  radius: number;           // fraction of max(width, height)
  stops: GradientStop[];
  blendOpacity?: number;
};

type Layer = LinearLayer | RadialLayer;

export type GradientSpec = {
  id: string;
  background: string;
  layers: Layer[];
};

// Figma file: JwkkStMTU8YpVbXRSHkUnZ (Sagnik's Playground)
export const GRADIENT_SPECS: GradientSpec[] = [
  // g1: Deep navy → cyan → emerald diagonal. Figma node 1212:2133.
  {
    id: 'g1',
    background: '#04122A',
    layers: [
      {
        kind: 'linear',
        from: [0, 0],
        to: [1, 1],
        stops: [
          { offset: 0, color: '#04122A' },
          { offset: 0.45, color: '#0F4F7A' },
          { offset: 0.75, color: '#22B7A8' },
          { offset: 1, color: '#3EE889' },
        ],
      },
      {
        kind: 'radial',
        center: [0.92, 0.96],
        radius: 0.85,
        stops: [
          { offset: 0, color: '#54FFA0', opacity: 0.65 },
          { offset: 1, color: '#54FFA0', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.08, 0.04],
        radius: 0.75,
        stops: [
          { offset: 0, color: '#020A1A', opacity: 0.55 },
          { offset: 1, color: '#020A1A', opacity: 0 },
        ],
      },
    ],
  },

  // g2: Burnt orange top-right + cream center + cobalt blue bottom. Figma node 1212:2160.
  {
    id: 'g2',
    background: '#04080E',
    layers: [
      {
        kind: 'radial',
        center: [0.95, 0.05],
        radius: 0.95,
        stops: [
          { offset: 0, color: '#FF5A10', opacity: 1 },
          { offset: 0.45, color: '#D84008', opacity: 0.85 },
          { offset: 1, color: '#D84008', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.18, 0.42],
        radius: 0.55,
        stops: [
          { offset: 0, color: '#F4EAD0', opacity: 0.95 },
          { offset: 1, color: '#F4EAD0', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.35, 0.95],
        radius: 0.75,
        stops: [
          { offset: 0, color: '#1A38C8', opacity: 0.95 },
          { offset: 0.55, color: '#0820A0', opacity: 0.7 },
          { offset: 1, color: '#0820A0', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.62, 0.78],
        radius: 0.35,
        stops: [
          { offset: 0, color: '#020410', opacity: 0.65 },
          { offset: 1, color: '#020410', opacity: 0 },
        ],
      },
    ],
  },

  // g3: Dark green base, cream bloom, vertical yellow band, hot-pink right. Figma node 1213:1753.
  {
    id: 'g3',
    background: '#020A06',
    layers: [
      {
        kind: 'linear',
        from: [0, 0.5],
        to: [1, 0.5],
        stops: [
          { offset: 0, color: '#03100A' },
          { offset: 0.35, color: '#1A0810' },
          { offset: 0.72, color: '#A00830' },
          { offset: 1, color: '#E81048' },
        ],
      },
      {
        kind: 'radial',
        center: [0.7, 0.45],
        radius: 0.18,
        stops: [
          { offset: 0, color: '#FFE020', opacity: 1 },
          { offset: 0.6, color: '#FFC008', opacity: 0.7 },
          { offset: 1, color: '#FFC008', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.68, 0.5],
        radius: 0.55,
        stops: [
          { offset: 0, color: '#FFD810', opacity: 0.35 },
          { offset: 1, color: '#FFD810', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.45, 0.48],
        radius: 0.32,
        stops: [
          { offset: 0, color: '#F2E2C8', opacity: 0.85 },
          { offset: 1, color: '#F2E2C8', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.95, 0.5],
        radius: 0.4,
        stops: [
          { offset: 0, color: '#FF1858', opacity: 0.9 },
          { offset: 1, color: '#FF1858', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.08, 0.5],
        radius: 0.5,
        stops: [
          { offset: 0, color: '#021008', opacity: 0.7 },
          { offset: 1, color: '#021008', opacity: 0 },
        ],
      },
    ],
  },

  // g4: Vibrant lime/emerald — bright center, dark corners. Figma node 1213:1776.
  {
    id: 'g4',
    background: '#001008',
    layers: [
      {
        kind: 'linear',
        from: [0.5, 0],
        to: [0.5, 1],
        stops: [
          { offset: 0, color: '#12E84A' },
          { offset: 0.55, color: '#08A030' },
          { offset: 1, color: '#003020' },
        ],
      },
      {
        kind: 'radial',
        center: [0.5, 0.25],
        radius: 0.65,
        stops: [
          { offset: 0, color: '#20FF60', opacity: 0.72 },
          { offset: 1, color: '#20FF60', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.05, 0.05],
        radius: 0.45,
        stops: [
          { offset: 0, color: '#000A04', opacity: 0.85 },
          { offset: 1, color: '#000A04', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.95, 0.94],
        radius: 0.45,
        stops: [
          { offset: 0, color: '#000A04', opacity: 0.9 },
          { offset: 1, color: '#000A04', opacity: 0 },
        ],
      },
    ],
  },

  // g5: Deep royal/cobalt blue — lighter diagonal, dark navy base. Figma node 1213:1823.
  {
    id: 'g5',
    background: '#030828',
    layers: [
      {
        kind: 'linear',
        from: [0, 0],
        to: [1, 1],
        stops: [
          { offset: 0, color: '#1A44C0' },
          { offset: 0.5, color: '#0C28A0' },
          { offset: 1, color: '#030A3A' },
        ],
      },
      {
        kind: 'radial',
        center: [0.25, 0.42],
        radius: 0.6,
        stops: [
          { offset: 0, color: '#3060E0', opacity: 0.62 },
          { offset: 1, color: '#3060E0', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.6, 0.88],
        radius: 0.5,
        stops: [
          { offset: 0, color: '#061890', opacity: 0.6 },
          { offset: 1, color: '#061890', opacity: 0 },
        ],
      },
      {
        kind: 'radial',
        center: [0.05, 0.05],
        radius: 0.38,
        stops: [
          { offset: 0, color: '#020510', opacity: 0.68 },
          { offset: 1, color: '#020510', opacity: 0 },
        ],
      },
    ],
  },
];

type Props = {
  spec: GradientSpec;
  width: number;
  height: number;
};

export function CardGradient({ spec, width, height }: Props) {
  const maxDim = Math.max(width, height);

  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Defs>
        {spec.layers.map((layer, i) => {
          const gradId = `${spec.id}-${i}`;
          if (layer.kind === 'linear') {
            return (
              <LinearGradient
                key={gradId}
                id={gradId}
                x1={layer.from[0] * width}
                y1={layer.from[1] * height}
                x2={layer.to[0] * width}
                y2={layer.to[1] * height}
                gradientUnits="userSpaceOnUse"
              >
                {layer.stops.map((s, si) => (
                  <Stop
                    key={si}
                    offset={s.offset}
                    stopColor={s.color}
                    stopOpacity={s.opacity ?? 1}
                  />
                ))}
              </LinearGradient>
            );
          }
          return (
            <RadialGradient
              key={gradId}
              id={gradId}
              cx={layer.center[0] * width}
              cy={layer.center[1] * height}
              rx={layer.radius * maxDim}
              ry={layer.radius * maxDim}
              fx={layer.center[0] * width}
              fy={layer.center[1] * height}
              gradientUnits="userSpaceOnUse"
            >
              {layer.stops.map((s, si) => (
                <Stop
                  key={si}
                  offset={s.offset}
                  stopColor={s.color}
                  stopOpacity={s.opacity ?? 1}
                />
              ))}
            </RadialGradient>
          );
        })}
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill={spec.background} />
      {spec.layers.map((layer, i) => (
        <Rect
          key={i}
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#${spec.id}-${i})`}
          opacity={layer.blendOpacity ?? 1}
        />
      ))}
    </Svg>
  );
}
