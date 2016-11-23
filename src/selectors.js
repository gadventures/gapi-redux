
export const selectItem = (state, resource, id) => {
  /**
   * Selects a single resource item from the store
  **/
  try {
    return state.resources[resource].data[id];
  } catch (error) {
    return null
  }
};

export const selectPage = (state, resource, page) => {
  /**
   * Selects all resource items in the given page.
   * Conveniently, returns an array of items.
  **/
  const itemList = [];
  try {
    state.resources[resource].pagination.pages[page].map( id => {
      if( state.resources[resource].data[id]) {
        itemList.push(state.resources[resource].data[id])
      }
    })
  } catch (error) {}
  return itemList;
};

export const selectCurrentPage = (state, resource) => {
  /**
   * Selects resource items in the current page.
   * Technically this function should be used within components, instead of `selectPage`
   * The pagination already knows which page to display.
   * Conveniently, returns an array of items.
  **/
  const itemList = [];
  try {
    const page = state.resources[resource].pagination.currentPage;
    if ( page )
      return selectPage(state, resource, page);
  } catch(error) {}
  return itemList
};

export const selectAll = (state, resource) => {
  /**
   * Selects all items currently available in the store
   * This does not necessarily reflect all items in Gapi,
   * only what has been loaded into the store.
   * Conveniently, returns an array of items.
  **/
  const itemList = [];
  try {
    for (const id of state.resources[resource].data) {
      itemList.push(
        state.resources[resource].data[id]
      )
    }
  } catch (error) {}
  return itemList;
};

export const selectPagination = (state, resource) => {
  try {
    return state.resources[resource].pagination
  } catch(error) {}
};

export const selectSearch = (state, resource) => {
  try {
    return state.resources[resource].search
  } catch(error) {}
};
