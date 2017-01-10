import reducers from './reducers';
import sagas from './sagas';
import {
  selectItem, selectPage, selectCurrentPage, selectAllPages, selectPagination, selectAll
} from './selectors';

export {
  reducers,
  sagas,
  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
}

// import { createStore, applyMiddleware, combineReducers } from 'redux'
// import createSagaMiddleware from 'redux-saga'
//
// import gapiReducres from './reducers';
// import gapiSagas from './sagas';
//
// const sagaMiddleware = createSagaMiddleware();
//
// const reducers = combineReducers({
//   ...gapiReducres
// });
//
// const store = createStore(
//   reducers,
//   window.__REDUX_DEVTOOLS_EXTENSION__
//   && window.__REDUX_DEVTOOLS_EXTENSION__(),
//   applyMiddleware(sagaMiddleware)
// );
//
// sagaMiddleware.run(gapiSagas);
//
// // ----------------------- //
//
// import {deleteResource, getResource, listResource, updateResource, createResource, allResource} from './actions';
// import {selectAll} from './selectors';
//
// store.dispatch(getResource('place_dossiers', 1000, {place: null}));
//
// // store.dispatch(listResource('place_dossiers', 'test', 1, {}, {places: null}, 3));
// // store.dispatch(listResource('place_dossiers', 'test', 2, {}, {places: null}, 3));
//
// // store.dispatch(getResource('activity_dossiers', 100, {start_location: null}));
//
// // setTimeout( () => {
// //   store.dispatch(deleteResource('country_dossiers', 14909))
// // }, 10000);
