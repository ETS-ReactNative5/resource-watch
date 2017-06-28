import React from 'react';
import { Router } from 'routes';
import { StickyContainer, Sticky } from 'react-sticky';

// Utils
import { substitution } from 'utils/utils';

// Components
import Aside from 'components/ui/Aside';
import DatasetForm from 'components/admin/dataset/form/DatasetForm';
import MetadataForm from 'components/admin/metadata/form/MetadataForm';
import VocabulariesAssociationForm from 'components/admin/vocabularies/association/VocabulariesAssociationForm';
import WidgetIndex from 'components/admin/widget/pages/index';

// Constants
const DATASET_SUBTABS = [{
  label: 'Edit dataset',
  value: 'edit',
  route: 'admin_data_detail',
  params: { tab: 'datasets', id: '{{id}}', subtab: 'edit' }
}, {
  label: 'Metadata',
  value: 'metadata',
  route: 'admin_data_detail',
  params: { tab: 'datasets', id: '{{id}}', subtab: 'metadata' }
}, {
  label: 'Vocabularies',
  value: 'vocabularies',
  route: 'admin_data_detail',
  params: { tab: 'datasets', id: '{{id}}', subtab: 'vocabularies' }
}, {
  label: 'Widgets',
  value: 'widgets',
  route: 'admin_data_detail',
  params: { tab: 'datasets', id: '{{id}}', subtab: 'widgets' }
}, {
  label: 'Layers',
  value: 'layers',
  route: 'admin_data_detail',
  params: { tab: 'datasets', id: '{{id}}', subtab: 'layers' }
}];

class DatasetShow extends React.Component {

  /**
   * HELPERS
   * - parseTabs
  */
  parseTabs(obj) {
    const { id } = this.props;
    return JSON.parse(substitution(JSON.stringify(obj), [{ key: 'id', value: id }]));
  }

  render() {
    const { id } = this.props;
    const subtab = this.props.subtab || 'edit';

    return (
      <div className="c-datasets-show">
        <StickyContainer>
          <div className="row l-row">
            <div className="columns small-12 medium-3">
              <Sticky>
                {
                  ({ style }) => (
                    <div style={style}>
                      <Aside
                        items={this.parseTabs(DATASET_SUBTABS)}
                        selected={subtab}
                      />
                    </div>
                  )
                }
              </Sticky>
            </div>

            <div className="columns small-12 medium-9">
              {subtab === 'edit' &&
                <DatasetForm
                  application={['rw']}
                  authorization={process.env.TEMP_TOKEN}
                  dataset={id}
                  onSubmit={() => Router.pushRoute('admin_data', { tab: 'datasets' })}
                />
              }

              {subtab === 'metadata' &&
                <MetadataForm
                  application={'rw'}
                  authorization={process.env.TEMP_TOKEN}
                  dataset={id}
                  onSubmit={() => Router.pushRoute('admin_data', { tab: 'datasets', id })}
                />
              }

              {subtab === 'vocabularies' &&
                <VocabulariesAssociationForm
                  application={'rw'}
                  authorization={process.env.TEMP_TOKEN}
                  dataset={id}
                  language="en"
                />
              }

              {subtab === 'widgets' &&
                <WidgetIndex dataset={id} />
              }

              {subtab === 'layers' &&
                'Layers'
              }
            </div>

          </div>
        </StickyContainer>
      </div>
    );
  }
}

DatasetShow.propTypes = {
  tab: React.PropTypes.string,
  id: React.PropTypes.string,
  subtab: React.PropTypes.string
};

export default DatasetShow;
