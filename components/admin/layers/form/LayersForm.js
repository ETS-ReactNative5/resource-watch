import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Services
import DatasetsService from 'services/DatasetsService';
import LayersService from 'services/LayersService';
import { toastr } from 'react-redux-toastr';

// Constants
import { STATE_DEFAULT, FORM_ELEMENTS } from 'components/admin/layers/form/constants';

// Components
import Step1 from 'components/admin/layers/form/steps/Step1';
import Navigation from 'components/form/Navigation';
import Spinner from 'components/ui/Spinner';

class LayersForm extends React.Component {
  constructor(props) {
    super(props);

    const formObj = props.dataset ?
      Object.assign({}, STATE_DEFAULT.form,
        { dataset: props.dataset, application: props.application }) :
      Object.assign({}, STATE_DEFAULT.form, {
        application: props.application
      });

    this.state = Object.assign({}, STATE_DEFAULT, {
      id: props.id,
      dataset: props.dataset,
      datasets: [],
      form: formObj,
      loading: !!props.id
    });

    // Service
    this.datasetsService = new DatasetsService({
      authorization: props.authorization,
      language: props.locale
    });

    this.service = new LayersService({
      authorization: props.authorization
    });

    // BINDINGS
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeDataset = this.onChangeDataset.bind(this);
    this.onStepChange = this.onStepChange.bind(this);
  }

  componentDidMount() {
    const { id } = this.state;

    const promises = [
      this.datasetsService.fetchAllData({})
    ];

    // Add the dashboard promise if the id exists
    if (id) {
      promises.push(this.service.fetchData({ id }));
    }

    Promise.all(promises)
      .then((response) => {
        const datasets = response[0];
        const current = response[1];

        const formState = (id) ? this.setFormFromParams(current) : this.state.form;

        const { provider, dataset } = current || {};

        this.setState({
          // CURRENT LAYER
          form: formState,
          loading: false,
          // CURRENT DATASET
          dataset: formState.dataset,
          // OPTIONS
          datasets: datasets.map(d => ({ label: d.name, value: d.id }))
        });
      })
      .catch((err) => {
        toastr.error('Error', err);
      });
  }

  /**
   * UI EVENTS
   * - onSubmit
   * - onChange
   * - onChangeDataset
  */
  onSubmit(event) {
    event.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate(this.state.step);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.step);
      const { interactions } = this.props;

      // Grab all the interactions from the redux store
      const interactionConfig = Object.assign(
        {},
        this.state.form.interactionConfig,
        { output: interactions.added }
      );

      const form = Object.assign({}, this.state.form, { interactionConfig });

      if (valid) {
        // if we are in the last step we will submit the form
        if (this.state.step === this.state.stepLength && !this.state.submitting) {
          const { id, dataset } = this.state;

          // Start the submitting
          this.setState({ submitting: true });

          this.service.saveData({
            dataset,
            id: id || '',
            type: (id) ? 'PATCH' : 'POST',
            body: form
          })
            .then((data) => {
              toastr.success('Success', `The layer "${data.id}" - "${data.name}" has been uploaded correctly`);
              if (this.props.onSubmit) this.props.onSubmit();
            })
            .catch((errors) => {
              this.setState({ submitting: false });
              try {
                errors.forEach(er =>
                  toastr.error('Error', er.detail)
                );
              } catch (e) {
                toastr.error('Error', 'Oops! There was an error, try again.');
              }
            });
        } else {
          this.setState({
            step: this.state.step + 1
          });
        }
      } else {
        toastr.error('Error', 'Fill all the required fields or correct the invalid values');
      }
    }, 0);
  }

  onChange(obj) {
    const form = Object.assign({}, this.state.form, obj);
    this.setState({ form });
  }

  onChangeDataset(dataset) {
    this.setState({ dataset });
  }

  onStepChange(step) {
    this.setState({ step });
  }

  // HELPERS
  setFormFromParams(params) {
    const newForm = {};

    Object.keys(params).forEach((f) => {
      switch (f) {
        default: {
          if ((typeof params[f] !== 'undefined' || params[f] !== null) ||
              (typeof this.state.form[f] !== 'undefined' || this.state.form[f] !== null)) {
            newForm[f] = params[f] || this.state.form[f];
          }
        }
      }
    });

    return newForm;
  }

  /**
   * Set the layer interaction of the store
   * @export
   * @param {Layer{}} layer
   */
  setLayerInteraction(layer) {
    return (dispatch) => {
      dispatch({
        type: SET_LAYERS_INTERACTION,
        payload: layer
      });
    };
  }

  setLayerInteractionSelected(id) {
    return (dispatch) => {
      dispatch({
        type: SET_LAYER_INTERACTION_SELECTED,
        payload: id
      });
    };
  }


  setLayerInteractionLatLng(latlng) {
    return (dispatch) => {
      dispatch({
        type: SET_LAYER_INTERACTION_LATLNG,
        payload: latlng
      });
    };
  }

  render() {
    return (
      <form className="c-form c-layers-form" onSubmit={this.onSubmit} noValidate>
        <Spinner isLoading={this.state.loading} className="-light" />

        {(this.state.step === 1 && !this.state.loading) &&
          <Step1
            ref={(c) => { this.step = c; }}
            form={this.state.form}
            id={this.state.id}
            dataset={this.state.dataset}
            datasets={this.state.datasets}
            onChange={value => this.onChange(value)}
            onChangeDataset={value => this.onChangeDataset(value)}
            setLayerInteraction={this.setLayerInteraction}
            setLayerInteractionSelected={this.setLayerInteractionSelected}
            setLayerInteractionLatLng={this.setLayerInteractionLatLng}
          />
        }

        {!this.state.loading &&
          <Navigation
            step={this.state.step}
            stepLength={this.state.stepLength}
            submitting={this.state.submitting}
            onStepChange={this.onStepChange}
          />
        }
      </form>
    );
  }
}

LayersForm.propTypes = {
  id: PropTypes.string,
  dataset: PropTypes.string,
  authorization: PropTypes.string,
  application: PropTypes.array,
  onSubmit: PropTypes.func,
  locale: PropTypes.string.isRequired,
  interactions: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  locale: state.common.locale,
  interactions: state.interactions
});

export default connect(mapStateToProps, null)(LayersForm);
