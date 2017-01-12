import reducers from './reducers';
import sagas, {getTempId} from './sagas';
import {
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource
} from './actions';
import {
  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
} from './selectors';

export {
  reducers,
  sagas,
  getTempId,
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource,

  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
}

// ----------------------- //

import { createStore, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  combineReducers({...reducers}),
  window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(sagas);

// store.dispatch(getResource('place_dossiers', 666666, {})); // 404
// store.dispatch(getResource('place_dossiers', 666, {})); // 200

// store.dispatch(listResource('place_dossiers', 'test', 1000000, {}, {}, 3)); // 500
// store.dispatch(listResource('place_dossiers', 'test', 1, {}, {}, 3)); // 200

const p = new Promise((resolve, reject) => {

  // store.dispatch(updateResource('place_dossiers', 666, {name: ''}, resolve, reject)); // 400
  store.dispatch(updateResource('place_dossiers', 666, {publish_state: 'unpublished'})); // 200

  // store.dispatch(createResource('place_dossiers', {"place": {"id": 8896463}, "publish_state": "unpublished"}, resolve, reject));
  // store.dispatch(createResource('place_dossiers', {}, resolve, reject));
});

p.then(
  res => {console.log('++++++++'), console.log(res)},
  err => {console.log('--------'), console.log(err)}
)

// store.dispatch(createResource('place_dossiers', getTempId(), {"place": {"id": 8896463}, "publish_state": "unpublished"})); // Validation error
// store.dispatch(createResource('place_dossiers', 666, {publish_state: 'unpublished'})); // 200
