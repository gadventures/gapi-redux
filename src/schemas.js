import {Schema, unionOf} from 'normalizr';


const place          = new Schema('places'),
      country        = new Schema('countries'),
      placeDossier   = new Schema('place_dossiers'),
      countryDossier = new Schema('country_dossiers'),

      dossier              = new Schema('dossiers'),
      accommodationDossier = new Schema('accommodation_dossiers'),
      activityDossier      = new Schema('activity_dossiers'),
      transportDossier     = new Schema('transport_dossiers'),

      feature = new Schema('features');


countryDossier.define({
  country: country
});

placeDossier.define({
  place: place
});

place.define({
  country: country,
  feature: feature
});


const dossierMembers = {
  accommodation_dossiers: accommodationDossier,
  activity_dossiers: activityDossier,
  transport_dossiers: transportDossier
};

dossier.define({
  /** union of used for polymorphic objects.
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
  features: feature
};
