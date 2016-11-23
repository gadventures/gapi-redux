import {
  GET_RESOURCE,
  GET_RESOURCE_FAIL,

  LIST_RESOURCE,
  LIST_RESOURCE_PAGED,

  CHANGE_PAGE,

  WRITE_PAGINATION,
  WRITE_STUB,
  WRITE_RESOURCE

} from './actionTypes';


export const listResource = (resource, page, query={}, pageSize=20, deep=true) => (
  {type: LIST_RESOURCE, resource, page, query, pageSize, deep}
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


export const getResource = (resource, id) => (
  {type: GET_RESOURCE, resource, id}
);
export const getResourceFail = (resource, id) => (
  {type: GET_RESOURCE_FAIL, resource, id}
);
