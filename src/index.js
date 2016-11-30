// import reducers from './reducers';
// import sagas from './sagas';
// import {
//   selectItem, selectPage, selectCurrentPage, selectPagination, selectAll
// } from './selectors';
//
// export {
//   reducers,
//   sagas,
//   selectItem,
//   selectPage,
//   selectCurrentPage,
//   selectPagination,
//   selectAll
// }

import { createStore, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'

import gapiReducres from './reducers';
import gapiSagas from './sagas';

const sagaMiddleware = createSagaMiddleware();

const reducers = combineReducers({
  ...gapiReducres
});

const store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(gapiSagas);

// ----------------------- //

import {getResource, listResource, updateResource, createResource} from './actions';

// store.dispatch(getResource('place_dossiers', 10028));
// store.dispatch(getResource('place_dossiers', 10028));
// store.dispatch(getResource('place_dossiers', 10028, {places: { countries: null }}));
// store.dispatch(getResource('dossiers', 2429, {transport_dossiers: ''}));
// store.dispatch(getResource('dossiers', 2430, {transport_dossiers: null, activity_dossiers: null, accommodation_dossiers: null}));

store.dispatch(createResource('country_dossiers', {
    "details": [{
        "body": "PINKY a narrow strip of land between the Pacific Ocean and the high peaks of the Andes, Chile includes the driest desert, the Atacama in the north, the agriculturally-rich Central Valley, snow-covered volcanoes, forests and tranquil lakes of the near south, and the wild and windswept glaciers and fjords of the far south. Travel Chile and you'll find the far south is home to some magnificent trekking opportunities, where guanacos, nandues (rheas), condors, pink flamingos and magellanic penguins abound. Chile travel aficionados also claim the south offers some of the world's finest salmon and trout fishing, and that at times the cuisine rivals the natural setting.",
        "detail_type": {"code": "COMMON__SUMMARY"},
        "code":"COMMON__SUMMARY",
        "id":"14848"
    }]
}));

// store.dispatch(getResource('country_dossiers', 1027));

// store.dispatch(listResource('dossiers', 1, {}, {transport_dossiers: null, activity_dossiers: null, accommodation_dossiers: null}));
// store.dispatch(getResource('place_dossiers', 10028));
// store.dispatch(getResource('places', 8896463));
// setTimeout(()=>{
//   store.dispatch(getResource('place_dossiers', 10028, {places: null}, true));
//
//   // setTimeout(()=>{
//   //   store.dispatch(listResource('countries', 1, 7))
//   // }, 2000)
//
// }, 2000);


// curl --request PATCH \
//      --data '{"publish_state": "unpublished"}' \
//      --url https://rest.gadventures.com/country_dossiers/1017/ \
//      --header 'content-type: application/json' \
//      --header 'x-application-key: test_29fb8348e8990800ad76e692feb0c8cce47f9476' \
//      --header 'x-fastly-bypass: pass'
//
//
// curl --request GET \
//      --url https://rest.gadventures.com/country_dossiers/1017/ \
//      --header 'content-type: application/json' \
//      --header 'x-application-key: test_29fb8348e8990800ad76e692feb0c8cce47f9476' \
//      --header 'x-fastly-bypass: pass'
