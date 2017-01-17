import {schemas} from './schemas';
import {denormalize} from 'denormalizr';

export const selectItem = (state, resource, id, selectRelated) => {
  /**
   * Selects a single resource item from the store
  **/
  let item = null;
  try {
    item = state.resources[resource][id];
    // return denormalize(item, state.resources, schemas[resource]);
    return item;
  } catch (error) {}
  return item;
};

export const selectPage = (state, resource, paginationKey, page) => {
  /**
   * Selects all resource items in the given page.
   * Conveniently, returns an array of items.
  **/
  const itemList = [];
  try {
    state.pagination[resource][paginationKey].pages[page].map( id => {
      if( state.resources[resource][id]) {
        itemList.push(selectItem(state, resource, id))
      }
    })
  } catch (error) {}
  return itemList;
};

export const selectCurrentPage = (state, resource, paginationKey, raw=false) => {
  /**
   * Selects resource items in the current page.
   * Technically this function should be used within components, instead of `selectPage`
   * The pagination already knows which page to display.
   * Conveniently, returns an array of items if `raw=false`.
  **/
  const itemList = [];
  try {
    const page = state.pagination[resource][paginationKey].currentPage;
    if ( page )
      return selectPage(state, resource, paginationKey, page);
  } catch(error) {}
  return itemList
};

export const selectAll = (state, resource, orderKey=null, raw=false) => {
  /**
   * Selects all items currently available in the store
   * This does not necessarily reflect all items in Gapi,
   * only what has been loaded into the store.
   * Conveniently, returns an array of items if raw=false.
  **/
  try {
    if(raw) {
      return orderKey
        ? sortObject(state.resources[resource], orderKey)
        : state.resources[resource];
    }
    return orderKey
           ? sortArray(Object.values(state.resources[resource]), orderKey)
           : Object.values(state.resources[resource])
  } catch (error) {
    return []
  }
};

export const selectAllPages = (state, resource, paginationKey, raw=false) => {
  /**
   * Selects all items on every page, loaded by a pagination.
   * @type {Array}
   */
  const data = {};
  try {
    const ids = state.pagination[resource][paginationKey].pages.all;
    ids.map( id => {
      const item = selectItem(state, 'places', id);
      if( item )
        data[id] = item
    });
  } catch(error) {}

  return raw ? data : Object.values(data)

};

export const selectPagination = (state, resource, paginationKey) => {
  /**
   * Selects the pagination info of a resource/key combination
   */
  try {
    return state.pagination[resource][paginationKey]
  } catch(error) {}
};


// ------------------------------ //

const sortObject = (object, key) => {
  const ordered = {};
  const list = Object.entries(object).sort( (a, b) => {
    const keyA = a[1][key],
          keyB = b[1][key];
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  list.map( entry => {
    ordered[entry[0]] = object[entry[0]]
  });
  return ordered;
};

const sortArray = (list, key) => {
  return list.sort((a, b) => {
    const keyA = a[key],
          keyB = b[key];
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
};
