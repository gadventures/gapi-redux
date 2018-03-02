if (! window._babelPolyfill) {
  require("babel-polyfill");
}

import reducers from './reducers';
import sagas, {sagaGenerator} from './sagas';
import {schemas} from './schemas';
import {
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource,
  clearPagination
} from './actions';
import selectors, {selectorGenerator} from './selectors';

const {
  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
} = selectors;

export {
  reducers,
  sagas,
  schemas,
  sagaGenerator,
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource,
  clearPagination,
  selectorGenerator,
  selectItem,
  selectPage,
  selectCurrentPage,
  selectAllPages,
  selectPagination,
  selectAll
};
