import {
  GET_RESOURCE,
  GET_RESOURCE_FAIL,

  LIST_RESOURCE,

  ALL_RESOURCE,

  WRITE_PAGINATION,
  WRITE_STUB,
  WRITE_RESOURCE,

  UPDATE_RESOURCE,
  UPDATE_RESOURCE_FAIL,
  UPDATE_RESOURCE_SUCCESS,

  CREATE_RESOURCE

} from './actionTypes';


export const allResource = (resource, getRelated={}) => (
  {type: ALL_RESOURCE, resource, getRelated}
);

export const listResource = (resource, page=1, query={}, getRelated={}, pageSize=20) => (
  {type: LIST_RESOURCE, resource, page, query, getRelated, pageSize}
);

export const writePagination = (resource, ids, count, page, pageSize) => (
  {type: WRITE_PAGINATION, resource, ids, count, page, pageSize}
);
export const writeStub = (resource, id, response) => (
  {type: WRITE_STUB, resource, id, response}
);
export const writeResource = (resource, id, response) => (
  {type: WRITE_RESOURCE, resource, id, response}
);

export const getResource = (resource, id, getRelated={}, force=false) => (
  {type: GET_RESOURCE, resource, id, getRelated, force}
);
export const getResourceFail = (resource, id, error) => (
  {type: GET_RESOURCE_FAIL, resource, id, error}
);

export const updateResource = (resource, id, data={}) => (
  {type: UPDATE_RESOURCE, resource, id, data}
);

export const createResource = (resource, data={}) => (
  {type: CREATE_RESOURCE, resource, data}
);
