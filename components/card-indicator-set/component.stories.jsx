import {
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { AdapterModifier } from '@widget-editor/widget-editor';
import RWAdapter from '@widget-editor/rw-adapter';

// components
import CardIndicatorSet from './component';
import CardIndicator from './card-indicator/component';

export default {
  title: 'Components/Card-Indicator-Set',
  component: CardIndicatorSet,
  argTypes: {},
};

const Template = (args) => {
  const [currentIndicator, setIndicator] = useState(args.indicator);
  const {
    config: {
      indicators,
    },
  } = args;

  const handleClickCard = useCallback((idSelected) => {
    setIndicator(indicators.find(({ id }) => idSelected === id));
  }, [indicators]);

  return (
    <div style={{
      ...args.containerStyles,
      ...args.theme !== 'primary' && {
        backgroundImage: 'none',
        background: '#f4f6f7',
      },
    }}
    >
      <CardIndicatorSet
        {...args}
        indicator={currentIndicator}
        handleClickCard={handleClickCard}
        theme={args.theme}
      >
        {args.config.indicators.map(({ id, title, icon }) => (
          <CardIndicator
            key={id}
            id={id}
            title={title}
            icon={icon}
            theme={args.theme}
          />
        ))}
      </CardIndicatorSet>
    </div>
  );
};

Template.propTypes = {
  args: PropTypes.shape({
    containerStyles: PropTypes.shape({}),
    config: PropTypes.shape({
      indicators: PropTypes.arrayOf(PropTypes.shape()),
    }).isRequired,
  }).isRequired,
};

export const Default = Template.bind({});

Default.args = {
  config: {
    indicators: [
      {
        id: 'marine-protected-areas',
        title: 'Marine Protected Areas',
        icon: 'marine',
        widgets: [
          {
            id: '50c3fb9c-cef3-4533-8ae7-9ad122bb7963',
          },
          {
            query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
            text: 'Some highlight text about why this matters',
            format: '.2f',
          },
        ],
        default: true,
      },
      {
        id: 'oceans-climate',
        title: 'Oceans and Climate',
        icon: 'climate',
        widgets: [
          {
            id: 'c8c4a6cc-6ac8-43a0-b988-f26301314a55',
          },
          {
            query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
            text: 'Some highlight text about why this matters',
            format: '.2f',
          },
        ],
      },
      {
        id: 'blue-economy',
        title: 'The Blue Economy',
        icon: 'economy',
        sections: [
          {
            title: 'section 1',
            widgets: [
              {
                id: 'fe388698-4a58-4c43-b2b1-4d169334b2e4',
              },
              {
                query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
                text: 'Some highlight text about why this matters',
                format: '.2f',
              },
            ],
            default: true,
          },
          {
            title: 'section 2',
            widgets: [
              {
                id: '41223a30-f4e8-4749-9b44-034443646da4',
              },
              {
                query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
                text: 'Some highlight text about why this matters',
                format: '.2f',
              },
            ],
          },
        ],
      },
      {
        id: 'land-sea-interface',
        title: 'The Land/Sea Interface',
        icon: 'land-sea',
        widgets: [
          {
            id: '5eec6ec5-51e5-4d39-af23-9d1cda64dc3a',
          },
          {
            query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
            text: 'Some highlight text about why this matters',
            format: '.2f',
          },
        ],
      },
      {
        id: 'ocean-dependence',
        title: 'Ocean Dependence',
        icon: 'dependence',
        widgets: [
          {
            id: '4e4501f3-3380-488c-8eca-8a9d99c90a70',
          },
          {
            query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
            text: 'Some highlight text about why this matters',
            format: '.2f',
          },
        ],
      },
      {
        id: 'biodiversity',
        title: 'Biodiversity',
        icon: 'biodiversity',
        widgets: [
          {
            id: 'f5a86ecb-e5d9-470e-ba57-33b3d0912881',
          },
          {
            query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
            text: 'Some highlight text about why this matters',
            format: '.2f',
          },
        ],
      },
    ],
  },
  params: {
    iso: 'BRA',
  },
  isInACollection: false,
  indicator: {
    id: 'marine-protected-areas',
    title: 'Marine Protected Areas',
    icon: 'marine',
    widgets: [
      {
        id: '50c3fb9c-cef3-4533-8ae7-9ad122bb7963',
      },
      {
        query: 'https://wri-rw.carto.com/api/v2/sql?q=WITH r as (SELECT ROW_NUMBER() OVER (ORDER BY total DESC) AS ranking, rw_country_code as country_code, rw_country_name as country_name, total/100. as x, \'percentage\' as unit, year FROM ene_012_electricity_access_edit WHERE year = 2018 AND year IS NOT NULL AND total IS NOT NULL ORDER BY total DESC), v as (SELECT count(distinct(country_code)), \'{{iso}}\' as country_code  FROM ene_012_electricity_access_edit) SELECT * FROM r INNER JOIN v ON r.country_code = v.country_code WHERE r.country_code = \'{{iso}}\'',
        text: 'Some highlight text about why this matters',
        format: '.2f',
      },
    ],
    default: true,
  },
  RWAdapter: AdapterModifier(RWAdapter, {
    endpoint: `${process.env.NEXT_PUBLIC_WRI_API_URL}/v1`,
    env: process.env.NEXT_PUBLIC_API_ENV,
    applications: process.env.NEXT_PUBLIC_APPLICATIONS.split(','),
    locale: 'en',
  }),
  containerStyles: {
    padding: 50,
    backgroundImage: 'url(\'/static/images/components/layout/header-bg-texture.png\'), linear-gradient(137.52deg, #c32d7b 0%, #0F4573 100%)',
  },
};
