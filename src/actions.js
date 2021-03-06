import {
  GET_RESOURCE,
  GET_RESOURCE_FAIL,

  LIST_RESOURCE,
  ALL_RESOURCE,
  LIST_RESOURCE_FAIL,

  WRITE_PAGINATION,
  WRITE_STUB,
  WRITE_RESOURCE,
  CHANGE_PAGE,

  CLEAR_PAGINATION,

  UPDATE_RESOURCE,
  UPDATE_RESOURCE_FAIL,
  UPDATE_RESOURCE_SUCCESS,

  CREATE_RESOURCE,
  CREATE_RESOURCE_FAIL,

  DELETE_RESOURCE

} from './actionTypes';

//////////////////////////////////////////////
////////////// Action Creators ///////////////
//////////////////////////////////////////////


export const getResource = (resource, id, {getRelated={}, force=false}={}) => (
  { type: GET_RESOURCE, resource, id, getRelated, force }
);
export const getResourceFail = (resource, id, error) => (
  {type: GET_RESOURCE_FAIL, resource, id, error}
);

export const allResource = (resource, {query={}, getRelated={}, orderBy, getStubs=true}={}) => (
  { type: ALL_RESOURCE, resource, query, getRelated, orderBy, getStubs }
);

export const listResource = (resource, paginationKey, {page=1, query={}, getRelated={}, pageSize=20, orderBy, getStubs=true}={}) => (
  { type: LIST_RESOURCE, resource, paginationKey, page, query, getRelated, pageSize, orderBy, getStubs }
);
export const listResourceFail = (resource, paginationKey, id, error) => (
  {type: LIST_RESOURCE_FAIL, resource, paginationKey, id, error}
);

export const writePagination = (resource, paginationKey, ids, count, page, pageSize, responseCode) => (
  {type: WRITE_PAGINATION, resource, paginationKey, ids, count, page, pageSize, responseCode}
);
export const writeStub = (resource, id, response) => (
  {type: WRITE_STUB, resource, id, response}
);
export const clearPagination = (resource, paginationKey) => (
  {type: CLEAR_PAGINATION, resource, paginationKey}
);

export const changePage = (resource, paginationKey, page) => (
  {type: CHANGE_PAGE, resource, paginationKey, page}
);

export const updateResource = (resource, id, {data={}, resolve, reject}={}) => (
  { type: UPDATE_RESOURCE, resource, id, data, resolve, reject }
);
export const updateResourceFail = (resource, id, error) => (
  {type: UPDATE_RESOURCE_FAIL, resource, id, error}
);

export const createResource = (resource, {data={}, resolve, reject}={}) => (
  { type: CREATE_RESOURCE, resource, data, resolve, reject }
);
export const createResourceFail = (resource, tempId, error) => (
  {type: CREATE_RESOURCE_FAIL, resource, tempId, error}
);

export const deleteResource = (resource, id) => (
  {type: DELETE_RESOURCE, resource, id}
);

export const writeResource = (resource, id, data, requestType, responseCode) => (
  {type: WRITE_RESOURCE, resource, id, data, requestType, responseCode}
);
