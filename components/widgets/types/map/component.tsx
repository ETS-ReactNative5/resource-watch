import { useState, useReducer, useMemo, useCallback, useEffect } from 'react';
import classnames from 'classnames';
import {
  Legend,
  LegendListItem,
  LegendItemToolbar,
  LegendItemButtonLayers,
  LegendItemButtonOpacity,
  LegendItemButtonVisibility,
  LegendItemTypes,
} from 'vizzuality-components';
import { useErrorHandler } from 'react-error-boundary';
import type { ViewportProps } from 'react-map-gl';

// constants
import { DEFAULT_VIEWPORT, MAPSTYLES, BASEMAPS, LABELS } from 'components/map/constants';

// components
import Spinner from 'components/ui/Spinner';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import MapControls from 'components/map/controls';
import ZoomControls from 'components/map/controls/zoom';
import WidgetHeader from '../../header';
import WidgetInfo from '../../info';
import WidgetCaption from '../../caption';

// utils
import { getLayerAttributions } from 'utils/layers';

// reducers
import { mapWidgetInitialState, mapWidgetSlice } from './reducer';

const mapWidgetReducer = mapWidgetSlice.reducer;

const {
  setMapLayerGroups,
  setMapLayerGroupVisibility,
  setMapLayerGroupActive,
  setMapLayerGroupsOrder,
  setMapLayerGroupOpacity,
} = mapWidgetSlice.actions;

import type { APIWidgetSpec } from 'types/widget';
import type { Basemap, Labels, LayerGroup, Bounds } from 'components/map/types';
import type { MapTypeWidgetContainerProps } from './index';

export interface MapTypeWidgetProps extends Omit<MapTypeWidgetContainerProps, 'widgetId'> {
  widget: APIWidgetSpec;
  shareableParams: Record<string, string | unknown>;
  layerGroups: LayerGroup[];
  // todo: improve typing of layers
  aoiLayer?: Record<string, string | unknown>;
  maskLayer?: Record<string, string | unknown>;
  isFetching: boolean;
  isError: boolean;
  isInACollection?: boolean;
  bounds?: Bounds | null;
  onFitBoundsChange: (viewport: ViewportProps) => void;
}

const MapTypeWidget = ({
  widget,
  shareableParams,
  layerGroups = [],
  aoiLayer = null,
  maskLayer = null,
  style = {},
  isEmbed = false,
  isWebshot = false,
  isFetching = false,
  isError = false,
  isInACollection = false,
  bounds,
  onToggleShare,
  onFitBoundsChange,
}: MapTypeWidgetProps): JSX.Element => {
  const handleError = useErrorHandler(isError ? new Error('something went wrong') : null);
  const [mapWidgetState, dispatch] = useReducer(mapWidgetReducer, {
    ...mapWidgetInitialState,
    layerGroups,
  });
  const [viewport, setViewport] = useState<ViewportProps>({
    ...DEFAULT_VIEWPORT,
    height: 400,
  });
  const [isInfoWidgetVisible, setInfoWidgetVisibility] = useState(false);

  const handleViewport = useCallback((_viewport: ViewportProps) => {
    setViewport(_viewport);
  }, []);

  const handleFitBoundsChange = useCallback(
    (_viewport: ViewportProps) => {
      onFitBoundsChange(_viewport);
    },
    [onFitBoundsChange],
  );

  const handleZoom = useCallback((zoom) => {
    setViewport((prevViewport) => ({
      ...prevViewport,
      zoom,
      transitionDuration: 250,
    }));
  }, []);

  const handleInfoToggle = useCallback(() => {
    setInfoWidgetVisibility((infoWidgetVisibility) => !infoWidgetVisibility);
  }, []);

  const handleShareToggle = useCallback(() => {
    onToggleShare(widget);
  }, [onToggleShare, widget]);

  const onChangeOpacity = useCallback((l, opacity) => {
    dispatch(
      setMapLayerGroupOpacity({
        dataset: {
          id: l.dataset,
        },
        opacity,
      }),
    );
  }, []);

  const onChangeVisibility = useCallback((l, visibility) => {
    dispatch(
      setMapLayerGroupVisibility({
        dataset: { id: l.dataset },
        visibility,
      }),
    );
  }, []);

  const onChangeLayer = useCallback((l) => {
    dispatch(
      setMapLayerGroupActive({
        dataset: {
          id: l.dataset,
        },
        active: l.id,
      }),
    );
  }, []);

  const onChangeOrder = useCallback((datasetIds) => {
    dispatch(setMapLayerGroupsOrder({ datasetIds }));
  }, []);

  const basemap: Basemap = useMemo(() => {
    if (!widget?.widgetConfig) return 'dark';

    const basemapKey = widget.widgetConfig?.basemapLayers?.basemap || 'dark';

    return BASEMAPS[basemapKey].value as Basemap;
  }, [widget]);

  const labels: Labels = useMemo(() => {
    if (!widget?.widgetConfig) return 'light';

    const label = widget.widgetConfig?.basemapLayers?.labels || 'light';

    return LABELS[label].value as Labels;
  }, [widget]);

  const boundaries = useMemo(
    () => Boolean(widget?.widgetConfig?.basemapLayers?.boundaries),
    [widget],
  );

  const caption = useMemo(() => widget?.metadata?.[0]?.info?.caption, [widget]);

  useEffect(() => {
    dispatch(setMapLayerGroups(layerGroups));
  }, [layerGroups]);

  const layers = useMemo(() => {
    const activeLayers = mapWidgetState.layerGroups.map((_layerGroup) =>
      (_layerGroup.layers || []).find((_layer) => _layer.active),
    );

    return [
      ...(aoiLayer !== null ? [aoiLayer] : []),
      ...(maskLayer !== null ? [maskLayer] : []),
      ...activeLayers.filter(Boolean),
    ];
  }, [mapWidgetState, aoiLayer, maskLayer]);

  const attributions = useMemo(() => getLayerAttributions(layers), [layers]);

  return (
    <div
      className={classnames('c-widget h-full', { '-is-embed': isEmbed })}
      style={{
        ...style,
      }}
    >
      {!isFetching && !isError && !isWebshot && (
        <div className="p-4 border border-b-0 rounded-tl rounded-tr border-gray-light">
          <WidgetHeader
            widget={widget}
            params={shareableParams}
            onToggleInfo={handleInfoToggle}
            onToggleShare={handleShareToggle}
            isInACollection={isInACollection}
            isInfoVisible={isInfoWidgetVisible}
          />
        </div>
      )}
      <div
        className={classnames(
          'relative flex h-full overflow-x-auto overflow-y-hidden widget-container grow',
          {
            'border-0': !isInfoWidgetVisible,
            'border border-gray-light': isInfoWidgetVisible,
            'rounded-none': caption,
          },
        )}
        style={{
          height: 400,
        }}
      >
        {isFetching && <Spinner isLoading className="-transparent" />}

        {!isFetching && !isError && (
          <>
            <Map
              mapStyle={MAPSTYLES}
              viewport={viewport}
              basemap={basemap}
              onMapViewportChange={handleViewport}
              onFitBoundsChange={handleFitBoundsChange}
              labels={labels}
              scrollZoom={false}
              bounds={bounds}
              boundaries={boundaries}
              attributions={attributions}
              onError={(errorMessage) => {
                handleError(new Error(errorMessage.error?.message));
              }}
            >
              {(_map) => <LayerManager map={_map} layers={layers} />}
            </Map>
            {!isWebshot && (
              <MapControls customClass="c-map-controls -embed">
                <ZoomControls viewport={viewport} onClick={handleZoom} />
              </MapControls>
            )}

            {layers.length > 0 && (
              <div className="c-legend-map -embed">
                <Legend maxHeight={140} onChangeOrder={onChangeOrder}>
                  {mapWidgetState.layerGroups.map((lg, i) => (
                    <LegendListItem
                      index={i}
                      key={lg.id}
                      layerGroup={lg}
                      {...(layerGroups.length > 1 && {
                        toolbar: (
                          <LegendItemToolbar>
                            <LegendItemButtonLayers />
                            <LegendItemButtonOpacity />
                            <LegendItemButtonVisibility />
                          </LegendItemToolbar>
                        ),
                      })}
                      onChangeOpacity={onChangeOpacity}
                      onChangeVisibility={onChangeVisibility}
                      onChangeLayer={onChangeLayer}
                    >
                      <LegendItemTypes />
                    </LegendListItem>
                  ))}
                </Legend>
              </div>
            )}
          </>
        )}
        {isInfoWidgetVisible && widget && !isFetching && (
          <WidgetInfo widget={widget} className="p-4" />
        )}
      </div>
      {caption && <WidgetCaption text={caption} />}
    </div>
  );
};

export default MapTypeWidget;
