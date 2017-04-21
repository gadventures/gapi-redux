import { getActualResourceName } from './sagas';


describe('getActualResourceName returns resource name', () => {

  /**
   * This method will use the schema to figure out the actual resource name of a sub-resource.
   * For example: `start_location` on an `activity_dossiers` is actually a `places` resource
   *              or `place` (singular) on `place_dossiers` is `places` (plural)
   */

  test('child exists as a child resource', () => {
    const resourceName = 'accommodation_dossiers';
    const normalized = { places: null };
    const child = 'location';
    expect(getActualResourceName(resourceName, normalized, child))
      .toEqual('places');
  });

  test('child exists on the schema', () => {
    const resourceName = 'accommodation_dossiers';
    const normalized = { countries: null };
    const child = 'primary_country';
    expect(getActualResourceName(resourceName, normalized, child))
      .toEqual('countries');
  });

  test('for nested resources', () => {
    /**
     * A good example would be `accommodation_dossiers.address.city`
     * where `address` is not a resource itself, so it must be ignored
     */
    const resourceName = 'accommodation_dossiers';
    const normalized = { places: null };
    const child = 'address.city';
    expect(getActualResourceName(resourceName, normalized, child))
      .toEqual('places');
  })
});
