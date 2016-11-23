import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import reducers from './reducers';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(sagas);

// ----------------------- //

import {getResource, listResource} from './actions';

// store.dispatch(getResource('countries', 'CA'));
// store.dispatch(getResource('countries', 'US'));
store.dispatch(getResource('countries', 'AF'));
// store.dispatch(listResource('countries', 1, 5));
// // store.dispatch(listResource('countries', 2, 5));
//
setTimeout(()=>{
  store.dispatch(listResource('countries', 1, 5));

  // setTimeout(()=>{
  //   store.dispatch(listResource('countries', 1, 7))
  // }, 2000)

}, 2000);


