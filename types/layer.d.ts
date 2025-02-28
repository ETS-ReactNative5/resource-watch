import { Source } from '@vizzuality/layer-manager';
import type { GeoJSONSourceRaw } from 'mapbox-gl';

export interface MaskLayer extends GeoJSONSourceRaw {
  id: string;
  opacity?: number;
}

export interface Render {
  layers?: Record<string, string | number | boolean | unknown>[];
}

export interface layerConfigBodySpec {
  attribution?: string;
}

export interface layerConfigSpec {
  render?: Render;
  source: Partial<Source>;
  [key: string]: Record<string, string | number | boolean | unknown> | string | boolean | number;
  attribution?: string;
  body?: layerConfigBodySpec;
}

export interface APILayerSpec {
  id: string;
  name: string;
  dataset: string;
  slug: string;
  description?: string;
  application: string[];
  type?: string;
  userId: string;
  iso: string[];
  provider: string;
  userId: string;
  default: boolean;
  protected: boolean;
  published: boolean;
  env: string;
  thumbnailUrl: string;
  layerConfig: layerConfigSpec;
  legendConfig: Record<string, string | number | boolean | unknown>;
  applicationConfig: Record<string, string | number | boolean | unknown>;
  interactionConfig: Record<string, string | number | boolean | unknown>;
  staticImageConfig: Record<string, string | number | boolean | unknown>;
  createdAt: string;
  updatedAt: string;
}
