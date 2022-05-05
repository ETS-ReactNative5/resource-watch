import { LayerSpec } from '@vizzuality/layer-manager';
import pick from 'lodash/pick';
import GL from '@luma.gl/constants';
import { TileLayer } from '@deck.gl/geo-layers';
import { DecodedLayer } from '@vizzuality/layer-manager-layers-deckgl';
import { MapboxLayer } from '@deck.gl/mapbox';

import type { APILayerSpec } from 'types/layer';

export interface MapboxLayerProps {
  id: string | number;
  tileSize: number;
}

export const isDeckLayer = (layer: LayerSpec): boolean => layer.type === 'deck';

export const parseDeckLayer = (layer: LayerSpec) => {
  const { id, deck } = layer;

  return deck?.map(({ type, subtype, params, data }) => {
    switch (type) {
      case 'TileLayer':
        return new MapboxLayer({
          id,
          type: TileLayer,
          data,
          tileSize: 256,
          visible: true,
          subtype,
          refinementStrategy: 'no-overlap',
          ...params,
          renderSubLayers: (sl) => {
            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity,
              subtype,
              decodeFunction,
              decodeParams,
            } = sl;

            const {
              z,
              bbox: { west, south, east, north },
            } = tile;

            if (data && subtype === 'DecodedRasterLayer') {
              return new DecodedLayer({
                id: subLayerId,
                image: data,
                bounds: [west, south, east, north],
                textureParameters: {
                  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
                },
                zoom: z,
                visible,
                opacity,
                decodeParams,
                decodeFunction,
                updateTriggers: {
                  decodeParams,
                  decodeFunction,
                },
              });
            }
            return null;
          },
          ...(params?.minZoom && { minZoom: params.minZoom }),
          ...(params?.maxZoom && { maxZoom: params.maxZoom }),
        });

      default:
        throw new Error(`Unsupported layer type: ${type}`);
    }
  });
};

export const parseLayers = (layers: APILayerSpec[]): LayerSpec[] =>
  layers.map((layer): LayerSpec => {
    const { id, layerConfig } = layer;
    const layerProps: LayerSpec = pick(layerConfig, [
      'deck',
      'images',
      'interactivity',
      'opacity',
      'params',
      'sqlParams',
      'source',
      'type',
      'render',
      'visibility',
      'zIndex',
    ]);

    return {
      id,
      ...layerProps,
    };
  });
