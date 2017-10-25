import {schema} from 'normalizr';

const countries = new schema.Entity('countries');
const features = new schema.Entity('features');

const dossier_features = new schema.Entity('dossier_features');
const dossier_segments = new schema.Entity('dossier_segments');

const reporting_offices = new schema.Entity('reporting_offices');
const tour_categories = new schema.Entity('tour_categories');

const images = new schema.Entity('images');
const videos = new schema.Entity('videos');

const country_dossiers = new schema.Entity('country_dossiers', {
  country: countries,
  segment: dossier_segments,
});

const places = new schema.Entity('places', {
  country: countries,
  feature: features,
});

const place_dossiers = new schema.Entity('place_dossiers', {
  place: places,
  segment: dossier_segments,
  images: [ images ],
  videos: [ videos ],
});

const accommodation_dossiers = new schema.Entity('accommodation_dossiers', {
  dossier_segment: dossier_segments,
  primary_country: countries,
  location: places,
  address: {
    city: places,
    country: countries
  },
  categories: [ tour_categories ],
  reporting_offices: [ reporting_offices ],
  images: [ images ],
  videos: [ videos ],
});

const activity_dossiers = new schema.Entity('activity_dossiers', {
  dossier_segment: dossier_segments,
  start_location: places,
  end_location: places,
  categories: [ tour_categories ],
  reporting_offices: [ reporting_offices ],
  images: [ images ],
  videos: [ videos ],
});
const transport_dossiers = new schema.Entity('transport_dossiers', {
  dossier_segment: dossier_segments,
  categories: [ tour_categories ],
  reporting_offices: [ reporting_offices ],
  images: [ images ],
  videos: [ videos ],
});

const dossiers = new schema.Entity('dossiers', {
  dossier: new schema.Union({
    accommodation_dossiers: accommodation_dossiers,
    activity_dossiers: activity_dossiers,
    transport_dossiers: transport_dossiers
  }, 'type')
});


dossier_features.define({
  parent: dossier_features
});

dossier_segments.define({
  parent: dossier_segments
});

tour_categories.define({
  category_type: tour_categories
});

export const schemas = {
  places,
  countries,
  place_dossiers,
  country_dossiers,
  dossiers,
  accommodation_dossiers,
  activity_dossiers,
  transport_dossiers,
  features,
  dossier_features,
  dossier_segments,
  reporting_offices,
  tour_categories,
  images,
  videos,
};
