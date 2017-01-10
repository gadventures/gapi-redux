import {

  GET_RESOURCE, GET_RESOURCE_FAIL,
  LIST_RESOURCE,
  WRITE_PAGINATION, WRITE_STUB, WRITE_RESOURCE,
  CLEAR_PAGINATION,
  DELETE_RESOURCE
} from './actionTypes';

const defaultPaginationState = {
  totalCount: null,
  currentPage: null,
  pageSize: null,
  pages: {
    all: []
  }
};

const addResourceToState = (state, resource) => {
  /**
   * Make sure the store has an entry for this resource.
   * e.g. data for `countries` would be stored under `state.resources.countries`
   */
  if ( !state.hasOwnProperty(resource) )
    state[resource] = {};
  return state
};

const addPaginationKeyToState = (state, resource, paginationKey, force=false) => {
  /**
   * Make sure the store stores pagination information for this resource/paginationKey
   */
  if ( force || !state.hasOwnProperty(resource) || !state[resource].hasOwnProperty(paginationKey) )
    state[resource] = {
      [paginationKey]: defaultPaginationState
    };
  return state
};

const resourceReducer = function( oldState={}, action ){
  let state = oldState;
  switch( action.type ) {

    case GET_RESOURCE:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          [action.id]: {               // e.g. state.resources.countries.CA
            ...state[action.resource][action.id],
            fetching: true
          }
        }
      };

    case GET_RESOURCE_FAIL:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          [action.id]: {               // e.g. state.resources.countries.CA
            ...state[action.resource][action.id],
            fetching: false
          }
        }
      };

    case WRITE_STUB:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          [action.id]: {               // e.g. state.resources.countries.CA
            ...action.response,
            stub: true,
            fetching: false
          }
        }
      };

    case WRITE_RESOURCE:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          [action.id]: {               // e.g. state.resources.countries.data.CA
            ...action.response,
            stub: false
          }
        }
      };

    case DELETE_RESOURCE:
      state = addResourceToState(state, action.resource);
      delete state[action.resource].data[action.id];
      return state;

    default:
      return state
  }
};

const paginationReducer = function( oldState={}, action ){

  let state = oldState;

  switch( action.type ) {
    case LIST_RESOURCE:

      console.log('------------')
      console.log(action)

      state = addPaginationKeyToState(state, action.resource, action.paginationKey);
      return {
        ...state,
        [action.resource]: {
          ...state[action.resource],
          [action.paginationKey]: {
            ...state[action.resource][action.paginationKey],
            query: action.query,
            fetching: true
          }
        }
      };

    case WRITE_PAGINATION:
      state = addPaginationKeyToState(state, action.resource, action.paginationKey);
      return {
        ...state,
        [action.resource]: {
          ...state[action.resource],
          [action.paginationKey]: {
            ...state[action.resource][action.paginationKey],
            fetching: false,
            totalCount: action.count,
            currentPage: action.page,
            pageSize: action.pageSize,
            pages: {
              ...state[action.resource][action.paginationKey].pages,
              all: [...state[action.resource][action.paginationKey].pages.all, ...action.ids],
              [action.page]: action.ids
            }
          }
        }
      };

    case CLEAR_PAGINATION:
      /**
       * Can either clear pagination for one key or the entire resource.
       * Clearing pagination for an entire resource would be useful after an add or delete,
       * as the placement of the new/removed item in the pagination depends on the ordering.
       */
      state = addPaginationKeyToState(state, action.resource, action.paginationKey);
      if(action.paginationKey){
        state[action.resource][action.paginationKey] = defaultPaginationState;
      }else{
        state[action.resource] = {}
      }
      return state;

    default:
      return state
  }
};

export default {
  resources: resourceReducer,
  pagination: paginationReducer
};
