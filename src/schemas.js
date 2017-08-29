import {schema} from 'normalizr';


const place = new schema.Entity('places');
const country = new schema.Entity('countries');
const placeDossier = new schema.Entity('place_dossiers');
const countryDossier = new schema.Entity('country_dossiers');

const dossier = new schema.Entity('dossiers');
const accommodationDossier = new schema.Entity('accommodation_dossiers');
const activityDossier = new schema.Entity('activity_dossiers');
const transportDossier = new schema.Entity('transport_dossiers');

const feature = new schema.Entity('features');
const dossierFeature = new schema.Entity('dossier_features');
const dossierSegment = new schema.Entity('dossier_segments');

const tourCategory = new schema.Entity('tour_categories');
const reportingOffice = new schema.Entity('reporting_offices');

place.define({
  country: country,
  feature: feature
});

countryDossier.define({
  country: country,
  segment: dossierSegment
});

placeDossier.define({
  place: place,
  segment: dossierSegment
});

dossierFeature.define({
  parent: dossierFeature
});

dossierSegment.define({
  parent: dossierSegment
});

activityDossier.define({
  dossier_segment: dossierSegment,
  start_location: place,
  end_location: place,
  categories: [ tourCategory ],
  reporting_offices: [ reportingOffice ],
});

accommodationDossier.define({
  dossier_segment: dossierSegment,
  primary_country: country,
  location: place,
  address: {
    city: place,
    country: country
  },
  categories: [ tourCategory ],
  reporting_offices: [ reportingOffice ],
});

transportDossier.define({
  dossier_segment: dossierSegment,
  categories: [ tourCategory ],
  reporting_offices: [ reportingOffice ],
});

dossier.define({
  dossier: new schema.Union({
    accommodation_dossiers: accommodationDossier,
    activity_dossiers: activityDossier,
    transport_dossiers: transportDossier
  }, 'type')
});

tourCategory.define({
  category_type: tourCategory
});

export const schemas = {
  places: place,
  countries: country,
  place_dossiers: placeDossier,
  country_dossiers: countryDossier,
  dossiers: dossier,
  accommodation_dossiers: accommodationDossier,
  activity_dossiers: activityDossier,
  transport_dossiers: transportDossier,
  features: feature,
  dossier_features: dossierFeature,
  dossier_segments: dossierSegment,
  reporting_offices: reportingOffice,
  tour_categories: tourCategory,
};
