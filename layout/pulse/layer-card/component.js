import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Link, Router } from 'routes';

// Utils
import { LAYERS_PLANET_PULSE } from 'utils/layers/pulse_layers';

// Components
import Legend from 'layout/pulse/legend';
import WidgetChart from 'components/charts/widget-chart';
import LoginRequired from 'components/ui/login-required';

// Modal
import Modal from 'components/modal/modal-component';
import SubscribeToDatasetModal from 'components/modal/SubscribeToDatasetModal';


class LayerCardComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showSubscribeToDatasetModal: false
    };
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.layerMenuPulse.layerActive && nextProps.layerMenuPulse.layerActive.id) !==
      (this.props.layerMenuPulse.layerActive && this.props.layerMenuPulse.layerActive.id)) {
      this.loadWidgets(nextProps);
      this.props.loadDatasetData({ id: nextProps.layerMenuPulse.layerActive.attributes.dataset });
    }
  }

  loadWidgets(nextProps) {
    const { layerMenuPulse } = nextProps;
    const layerActive = layerMenuPulse.layerActive && layerMenuPulse.layerActive.id;

    if (layerActive) {
      let found = false;
      for (let i = 0; i < LAYERS_PLANET_PULSE.length && !found; i++) {
        found = LAYERS_PLANET_PULSE[i].layers.find(obj => obj.id === layerActive);
      }
      if (found) {
        const { widgets } = found;
        if (widgets && widgets.length > 0) {
          this.props.loadWidgetData(widgets[0]);
        } else {
          this.props.setWidget(null);
        }
      }
    }
  }

  handleToggleSubscribeToDatasetModal = (bool) => {
    this.setState({ showSubscribeToDatasetModal: bool });
  }

  render() {
    const { showSubscribeToDatasetModal } = this.state;
    const { layerMenuPulse, layerCardPulse } = this.props;
    const { layerActive, layerPoints } = layerMenuPulse;
    const { dataset, widget } = layerCardPulse;
    const subscribable = dataset && dataset.attributes && dataset.attributes.subscribable &&
      Object.keys(dataset.attributes.subscribable).length > 0;

    const className = classNames({
      'c-layer-card': true,
      '-hidden': layerActive === null
    });

    const datasetId = (layerActive !== null) ? layerActive.attributes.dataset : null;
    const contextLayers = layerActive && layerActive.contextLayers;

    return (
      <div className={className}>
        <h3>{layerActive && layerActive.label}</h3>
        {layerActive && layerActive.descriptionPulse}
        {layerPoints && layerPoints.length > 0 &&
          <div className="number-of-points">
            Number of objects: {layerPoints.length}
          </div>
        }
        <Legend
          layerActive={layerActive}
          className={{ color: '-dark' }}
        />
        {contextLayers &&
          <div className="context-layers-legends">
            {
              contextLayers.map(ctLayer => ctLayer.active && (
                <Legend
                  layerActive={ctLayer}
                  className={{ color: '-dark' }}
                />
              ))
            }
          </div>
        }
        {widget &&
          <div>
            <h5>Similar content</h5>
            <div
              key={widget.id}
              className="widget-card"
              onClick={() => Router.pushRoute('explore_detail', { id: widget.attributes.dataset })}
              role="button"
              tabIndex={-1}
            >
              <div className="widget-title">
                {widget.attributes.name}
              </div>

              <WidgetChart
                widget={widget.attributes}
                mode="thumbnail"
              />
            </div>
          </div>
        }
        <div className="card-buttons">
          { datasetId &&
            <Link
              route="explore_detail"
              params={{ id: datasetId }}
            >
              <a className="c-button -tertiary link_button" >Explore the data</a>
            </Link>
          }
          { subscribable &&
            <LoginRequired text="Log in or sign up to subscribe to alerts from this dataset">
              <button
                className="c-button -tertiary link_button"
                onClick={() => this.handleToggleSubscribeToDatasetModal(true)}
              >
                Subscribe to alerts
                <Modal
                  isOpen={showSubscribeToDatasetModal}
                  onRequestClose={() => this.handleToggleSubscribeToDatasetModal(false)}
                >
                  <SubscribeToDatasetModal
                    dataset={dataset}
                    showDatasetSelector={false}
                    onRequestClose={() => this.handleToggleSubscribeToDatasetModal(false)}
                  />
                </Modal>
              </button>
            </LoginRequired>
          }
        </div>
      </div>
    );
  }
}

LayerCardComponent.propTypes = {
  // PROPS
  layerMenuPulse: PropTypes.object.isRequired,
  layerCardPulse: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,

  // Actions
  loadDatasetData: PropTypes.func.isRequired,
  loadWidgetData: PropTypes.func.isRequired,
  setWidget: PropTypes.func.isRequired
};

export default LayerCardComponent;
