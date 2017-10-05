if (! window._babelPolyfill) {
  require("babel-polyfill");
}

import {
  reducers,
  sagas,
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource,
  clearPagination,
  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
} from './index';


import { createStore, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { fork } from 'redux-saga/effects';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers({...reducers}),
  window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(sagaMiddleware)
);

const gapiSagas = function* gapiSagas() {
  yield [
    fork(sagas, { key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476', proxy: 'version=alldossiers' }) // provide actual key
  ];
};

sagaMiddleware.run(gapiSagas);

// const relatedDossiers = {
//   accommodation_dossiers:
//     { dossier_segment: null, primary_country: null, location: { country: null } },
//   activity_dossiers: {
//     dossier_segment: null,
//     start_location:  { country: null },
//     end_location:    { country: null },
//   },
//   transport_dossiers: { dossier_segment: null },
// };

const query = `{
  id,
    variations {
      image {
        modification
        file {
          url
        }
      }
      href
    }
  }
}
`;
//
// `query query($id: ID!) { image(id: $id){  id,  variations {    image {      modification      file {        url      }    }    href  }}}`

// store.dispatch(listResource('dossiers', 'all_dossiers')); // 404
store.dispatch(getResource('images', 3041, { gqlQuery: query } )); // 200
// store.dispatch(getResource('activity_dossiers', 6962, {getRelated: {images: null}} )); // 200
// store.dispatch(getResource('activity_dossiers', 3093, {getRelated: {images: null}} )); // 200
// store.dispatch(listResource('images', 'all_images' )); // 200
// store.dispatch(listResource('dossiers', 'all_dossiers', {
//   getRelated: relatedDossiers,
//   orderBy: ['-date_last_modified'],
// })); // 200
// store.dispatch(listResource('country_dossiers', 'allCountries', {getRelated: {country: null}})); // 200

// const handleChanges = () => {
//   const state = store.getState();
//   // const state = {"resources":{"dossiers":{"10":{"id":"10","href":"https://rest-orig.gadventures.com/dossiers/10","date_created":"2016-05-24T19:24:19.672769Z","date_last_modified":"2017-01-16T00:21:09.003375Z","dossier":{"id":"4546","schema":"accommodation_dossiers"},"stub":false,"fetching":false},"undefined":{}},"place_dossiers":{"666":{"id":"666","href":"https://rest-orig.gadventures.com/place_dossiers/666","name":"Hoi An","type":"place_dossiers","date_created":"2014-07-03T09:25:46","date_last_modified":"2017-01-12T16:15:17","publish_state":"unpublished","place":"8649090","images":[{"id":1655,"href":"https://rest-orig.gadventures.com/images/1655"}],"details":[{"id":"3744","body":"Hoi An’s preserved historic Old Town (and World Heritage Site) is a throwback to the days when the city was a major Southeast Asian trading port. Today, it’s also a shopping haven, with tailors whipping up customized clothing overnight and craftsmen designing lanterns on demand. Looking for adventure? Nothing beats travelling the Hai Van Pass, a scenic 21km (13 mi) mountain trail.\r\n","detail_type":{"label":"Summary","code":"COMMON__SUMMARY"}}],"stub":false,"fetching":false},"undefined":{}},"accommodation_dossiers":{"4546":{"id":"4546","href":"https://rest-orig.gadventures.com/accommodation_dossiers/4546","name":"Hotel Madares","type":"accommodation_dossiers","date_created":"2014-09-15T13:35:43","date_last_modified":"2017-01-16T18:41:22","publish_state":"published","address":{"address_line_1":"Loutro Village","address_line_2":"r","address_line_3":"r","postal_code":"73101","country":{"id":"GR","href":"https://rest-orig.gadventures.com/countries/GR","name":"Greece"},"city":{"id":"2516414","href":"https://rest-orig.gadventures.com/places/2516414","name":"Loutro"}},"location":{"id":"8897364","href":"https://rest-orig.gadventures.com/places/8897364","name":"Hotel Madares"},"phone_numbers":[{"id":"3160","phone":"2825091166","phone_type":{"id":"3","label":"work","code":"PHONE__WORK","parent":{"id":"1","label":"Phone","code":"PHONE"}}}],"emails":[{"id":"1621","email":"madareshotel@gmail.com","email_type":{"id":"8","label":"work","code":"EMAIL__WORK","parent":{"id":"2","label":"Email","code":"EMAIL"}}}],"property_type":{"code":"GITE","label":"Gîte"},"primary_country":"GR","website":"http://www.loutro.gr/en/accommodation/22-madares","rooms":[{"id":"4547","features":[{"id":"19","href":"https://rest-orig.gadventures.com/dossier_features/19","label":"Air Conditioning","code":"ROOM__AIR_CONDITIONING"},{"id":"22","href":"https://rest-orig.gadventures.com/dossier_features/22","label":"Heat","code":"ROOM__HEAT"},{"id":"24","href":"https://rest-orig.gadventures.com/dossier_features/24","label":"Private Bath","code":"ROOM__PRIVATE_BATH"}],"room_type":null,"service_level":{"code":"STANDARD","label":"Standard"},"sharing_level":{"code":"TWIN_SHARE","label":"Twin Share"},"quantity":null,"traveller_occupancy":null,"max_occupancy":null}],"dossier_segment":null,"features":[{"id":"10","href":"https://rest-orig.gadventures.com/dossier_features/10","label":"Restaurant","code":"ACCOMMODATION__RESTAURANT"},{"id":"12","href":"https://rest-orig.gadventures.com/dossier_features/12","label":"24-hour Front Desk","code":"ACCOMMODATION__24_HOUR_FRONT_DESK"}],"details":[],"stub":false,"fetching":false},"undefined":{}},"places":{"8649090":{"id":"8649090","href":"https://rest.gadventures.com/places/8649090","name":"Hoi An","ascii_name":"Hoi An","population":32757,"elevation":null,"latitude":"15.87944","longitude":"108.33500","bounding_box":[],"date_created":"2014-05-09T13:11:08Z","date_last_modified":"2014-12-03T21:05:11Z","country":"VN","state":{"id":"VN-27","href":"https://rest.gadventures.com/states/VN-27","name":"Quang Nam"},"admin_divisions":[{"id":"8663919","href":"https://rest.gadventures.com/places/8663919","name":"Tỉnh Quảng Nam","feature":{"id":"1","href":"https://rest.gadventures.com/features/1","name":"first-order administrative division"}}],"feature":"209","timezone":{"id":"238","href":"https://rest.gadventures.com/timezones/238","code":"Asia/Ho_Chi_Minh","gmt_offset":"7.0","dst_offset":"7.0"},"alternate_names":["Faifo","Faifoh","Faifoo","Feifu","Hoi An","Hôi An","Hội An","Khoj","hoian","Хой","ホイアン"],"place_dossier":null,"places_of_interest":[],"stub":false,"fetching":false},"undefined":{}},"countries":{"VN":{"id":"VN","href":"https://rest.gadventures.com/countries/VN","name":"Vietnam","states":{"href":"https://rest.gadventures.com/countries/VN/states"},"stub":false,"fetching":false},"undefined":{},"GR":{"stub":true,"fetching":false}},"features":{"209":{"stub":true,"fetching":false}}},"pagination":{}};
//   const item = selectItem(state, 'dossiers', 10);
//   // console.log(item)
// };
//
// store.subscribe(handleChanges);

// store.dispatch(listResource('place_dossiers', 'test', 1000000, {}, {}, 3)); // 500
// store.dispatch(listResource('place_dossiers', 'test', 1, {}, {}, 3)); // 200

// const p = new Promise((resolve, reject) => {

// store.dispatch(updateResource('place_dossiers', 666, {place: null}));
// store.dispatch(updateResource('place_dossiers', 666, {name: ''}));

// const p = new Promise((resolve, reject) => {
// });

// p.then( (response) => {
//   console.log('success');
//   console.log(response)
// }, (error) => {
//   console.log('error');
//   console.log(error.message)
// });

//   store.dispatch(updateResource('place_dossiers', 666, {publis h_state: 'unpublished'})); // 200
//
//   // store.dispatch(createResource('place_dossiers', {"place": {"id": 8896463}, "publish_state": "unpublished"}, resolve, reject));
//   // store.dispatch(createResource('place_dossiers', {}, resolve, reject));
// });

// store.dispatch(createResource('place_dossiers', getTempId(), {"place": {"id": 8896463}, "publish_state": "unpublished"})); // Validation error
// store.dispatch(createResource('place_dossiers', 666, {publish_state: 'unpublished'})); // 200
//*/
