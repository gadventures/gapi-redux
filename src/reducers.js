import {
  GET_RESOURCE, GET_RESOURCE_FAIL,
  LIST_RESOURCE,
  WRITE_PAGINATION, WRITE_STUB, WRITE_RESOURCE
} from './actionTypes';


const addResourceToState = (state, resource) => {
  /**
   * Make sure the store has an entry for this resource.
   * e.g. data for `countries` would be stored under `state.resources.countries`
   */
  if ( !state.hasOwnProperty(resource) )
    state[resource] = {
      data: {},
      pagination: {}
    };
  return state
};

const resourceReducer = function( oldState={}, action ){

  let state = oldState;

  switch( action.type ) {

    case GET_RESOURCE:
      return {...state, fetching: true};

    case GET_RESOURCE_FAIL:
      return {...state, fetching: false};

    case LIST_RESOURCE:
      return {...state, fetching: true};

    case WRITE_STUB:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          data: {
            ...state[action.resource].data,
            [action.id]: {               // e.g. state.resources.countries.CA
              ...action.response,
              stub: true
            }
          }
        }
      };

    case WRITE_RESOURCE:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {           // e.g. state.resources.countries
          ...state[action.resource],
          data: {
            ...state[action.resource].data,
            [action.id]: {               // e.g. state.resources.countries.data.CA
              ...action.response,
              stub: false
            }
          }
        }
      };

    case WRITE_PAGINATION:
      state = addResourceToState(state, action.resource);
      return {
        ...state,
        [action.resource]: {
          ...state[action.resource],
          pagination: {
            totalCount: action.count,
            currentPage: action.page,
            pageSize: action.pageSize,
            pages: {
              ...state[action.resource].pagination.pages,
              [action.page]: action.ids
            }
          }
        }
      };

    default:
      return state
  }
};

export default {
  resources: resourceReducer
};
