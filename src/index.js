if (! window._babelPolyfill) {
  require("babel-polyfill");
}

import reducers from './reducers';
import sagas from './sagas';
import {
  getResource,
  listResource,
  allResource,
  updateResource,
  createResource,
  deleteResource,
  clearPagination
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
};
