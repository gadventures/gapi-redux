import {Schema, unionOf, arrayOf} from 'normalizr';


const place          = new Schema('places'),
      country        = new Schema('countries'),
      placeDossier   = new Schema('place_dossiers'),
      countryDossier = new Schema('country_dossiers'),

      dossier              = new Schema('dossiers'),
      accommodationDossier = new Schema('accommodation_dossiers'),
      activityDossier      = new Schema('activity_dossiers'),
      transportDossier     = new Schema('transport_dossiers'),

      feature = new Schema('features'),
      dossierFeature = new Schema('dossier_features'),
      dossierSegment = new Schema('dossier_segments');

countryDossier.define({
  country: country,
  segment: dossierSegment
});

placeDossier.define({
  place: place,
  segment: dossierSegment
});

place.define({
  country: country,
  feature: feature
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
  end_location: place
});

accommodationDossier.define({
  dossier_segment: dossierSegment,
  primary_country: country
});

transportDossier.define({
  dossier_segment: dossierSegment
});

const dossierMembers = {
  accommodation_dossiers: accommodationDossier,
  activity_dossiers: activityDossier,
  transport_dossiers: transportDossier
};

dossier.define({
  /** `unionOf` used for polymorphic objects.
   *  https://github.com/paularmstrong/normalizr#unionofschemamap-options
  **/
  dossier: unionOf(dossierMembers, {schemaAttribute: 'type'})
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
  dossier_segments: dossierSegment
};
