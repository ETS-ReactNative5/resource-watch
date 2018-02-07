/* global config */
import 'isomorphic-fetch';

// Components
import LayerGlobeManager from 'utils/layers/LayerGlobeManager';

// Utils
import { LAYERS_PLANET_PULSE } from 'utils/layers/pulse_layers';


/**
 * CONSTANTS
*/
const GET_LAYERS_SUCCESS = 'planetpulse/GET_LAYERS_SUCCESS';
const GET_LAYERS_ERROR = 'planetpulse/GET_LAYERS_ERROR';
const GET_LAYERS_LOADING = 'planetpulse/GET_LAYERS_LOADING';

const SET_ACTIVE_LAYER = 'planetpulse/SET_ACTIVE_LAYER';

const GET_LAYER_POINTS_SUCCESS = 'planetpulse/GET_LAYER_POINTS_SUCCESS';
const GET_LAYER_POINTS_ERROR = 'planetpulse/GET_LAYER_POINTS_ERROR';
const RESET_LAYER_POINTS = 'planetpulse/RESET_LAYER_POINTS';

const SET_SIMILAR_WIDGETS = 'planetpulse/SET_SIMILAR_WIDGETS';
const TOGGLE_CONTEXTUAL_LAYER = 'planetpulse/TOGGLE_CONTEXTUAL_LAYER';

/**
 * REDUCER
*/
const initialState = {
  layers: [],
  loading: false,
  error: false,
  layerActive: null,
  layerPoints: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_LAYERS_SUCCESS:
      return Object.assign({}, state, { layers: action.payload, loading: false, error: false });
    case GET_LAYERS_ERROR:
      return Object.assign({}, state, { error: true, loading: false });
    case GET_LAYERS_LOADING:
      return Object.assign({}, state, { loading: true, error: false });
    case SET_ACTIVE_LAYER:
      return Object.assign({}, state, {
        layerActive: (state.layerActive !== action.payload) ? action.payload : null
      });
    case SET_SIMILAR_WIDGETS:
      return Object.assign({}, state, {
        similarWidgets: action.payload
      });
    case GET_LAYER_POINTS_SUCCESS:
      return Object.assign({}, state, {
        layerPoints: action.payload,
        error: false
      });
    case GET_LAYER_POINTS_ERROR:
      return Object.assign({}, state, {
        error: true,
        errorMessage: action.payload
      });
    case RESET_LAYER_POINTS:
      return Object.assign({}, state, {
        layerPoints: null
      });
    case TOGGLE_CONTEXTUAL_LAYER: {
      const newContextLayers = state.layerActive.contextLayers.map((l) => {
        if (l.attributes.id === action.payload) {
          return { ...l, active: !l.active };
        } else { // eslint-disable-line no-else-return
          return l;
        }
      });
      const newLayerActive = { ...state.layerActive, contextLayers: newContextLayers };
      const newState = { ...state, layerActive: newLayerActive };
      return newState;
    }
    default:
      return state;
  }
}

/**
 * ACTIONS
 * - getLayers
 * - setActiveDataset
 * - getLayerPoints
*/
export function getLayers() {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    dispatch({ type: GET_LAYERS_LOADING });

    const layers = LAYERS_PLANET_PULSE;
    dispatch({
      type: GET_LAYERS_SUCCESS,
      payload: layers
    });
  };
}

export function toggleActiveLayer({
  id,
  threedimensional,
  markerType,
  basemap,
  contextLayers,
  descriptionPulse
}) {
  return (dispatch) => {
    if (id) {
      fetch(new Request(`${process.env.WRI_API_URL}/layer/${id}`))
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        })
        .then(async (response) => {
          const layer = response.data;
          layer.threedimensional = threedimensional;
          layer.markerType = markerType;
          layer.basemap = basemap;
          layer.contextLayers = [];
          layer.descriptionPulse = descriptionPulse;

          if (contextLayers.length > 0) {
            let layersLoaded = 0;
            const urlSt = `${process.env.WRI_API_URL}/layer/?ids=${contextLayers.join()}&env=production,preproduction`;
            fetch(new Request(urlSt))
              .then((resp) => {
                return resp.json();
              })
              .then((res) => {
                const layerGlobeManager = new LayerGlobeManager();
                res.data.forEach((l) => {
                  layerGlobeManager.addLayer(
                    { ...l.attributes, id: l.id },
                    {
                      onLayerAddedSuccess: function success(result) {
                        layer.contextLayers.push(result);
                        layersLoaded++;
                        if (contextLayers.length === layersLoaded) {
                          dispatch({
                            type: SET_ACTIVE_LAYER,
                            payload: layer
                          });
                        }
                      }
                    },
                    true
                  );
                });
              });
          } else {
            dispatch({
              type: SET_ACTIVE_LAYER,
              payload: layer
            });
          }
        })
        .catch(() => {
          // Fetch from server ko -> Dispatch error
          dispatch({
            type: SET_ACTIVE_LAYER,
            payload: null
          });
        });
    } else {
      dispatch({
        type: SET_ACTIVE_LAYER,
        payload: null
      });
    }
  };
}

export function getLayerPoints(queryUrl) {
  return (dispatch) => {
    // Waiting for fetch from server -> Dispatch loading
    // dispatch({ type: GET_LAYERS_LOADING });
    // TODO: remove the date now
    fetch(new Request(queryUrl))
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((response) => {
        dispatch({
          type: GET_LAYER_POINTS_SUCCESS,
          payload: response.data
        });
      })
      .catch((err) => {
      // Fetch from server ko -> Dispatch error
        dispatch({
          type: GET_LAYER_POINTS_ERROR,
          payload: err.message
        });
      });
  };
}

export function setSimilarWidgets(value) {
  return dispatch => dispatch({ type: SET_SIMILAR_WIDGETS, payload: value });
}

export function resetLayerPoints() {
  return dispatch => dispatch({ type: RESET_LAYER_POINTS, payload: null });
}

export function toggleContextualLayer(layerId) {
  return dispatch => dispatch({ type: TOGGLE_CONTEXTUAL_LAYER, payload: layerId });
}
