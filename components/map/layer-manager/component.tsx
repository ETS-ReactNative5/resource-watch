import { useMemo, useEffect } from 'react';
import { LayerManager as VizzLayerManager, Layer } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import type { MapRef } from 'react-map-gl';
import { APILayerSpec } from 'types/layer';

import ResourceWatchProviders from './providers';
import { parseLayers, isDeckLayer, parseDeckLayer } from './utils';

const LayerManager = ({ layers, map }: { map: MapRef; layers: APILayerSpec[] }): JSX.Element => {
  const parsedLayers = useMemo(() => parseLayers(layers), [layers]);

  const deckLayer = useMemo(
    () =>
      parsedLayers
        .filter((layer) => isDeckLayer(layer))
        .reduce((acc, next) => [...acc, ...parseDeckLayer(next)], []),
    [parsedLayers],
  );

  useEffect(() => {
    const [layer] = deckLayer;
    if (layer && typeof layer.setProps === 'function') {
      const {
        props: { decodeFunction, decodeParams },
      } = layer;
      layer.setProps({
        decodeParams,
        decodeFunction,
      });
    }
  }, [deckLayer]);

  return (
    <VizzLayerManager map={map} plugin={PluginMapboxGl} providers={ResourceWatchProviders}>
      {parsedLayers.map((_layer) => (
        <Layer key={_layer.id} {..._layer} {...(deckLayer && { deck: deckLayer })} />
      ))}
    </VizzLayerManager>
  );
};

export default LayerManager;
