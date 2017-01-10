import {takeEvery} from 'redux-saga';
import { put, select } from 'redux-saga/effects'
import {normalize, arrayOf} from 'normalizr';
import Gapi from './gapi-client';
import {schemas} from './schemas';

import {
  GET_RESOURCE, LIST_RESOURCE, ALL_RESOURCE,
  UPDATE_RESOURCE, CREATE_RESOURCE,
  DELETE_RESOURCE
} from './actionTypes';

import {
  getResource, getResourceFail,
  listResourceFail,
  writePagination, writeStub, writeResource, changePage,
  clearPagination
} from './actions';

import {selectItem, selectPagination} from './selectors';

// TODO: Error Handling
// TODO: For loops

function _hasNext(res) {
  let hasNext = false;
  res.links.map( link => {
    try{
      if( link.rel === 'next' )
        hasNext = true;
    } catch (err){}
  });
  return hasNext;
}

function *_requestItem(resource, id) {
  /**
   * Makes a request for a single object from gapi.
   */
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});
  const promise = new Promise( (resolve, reject) => {
    gapi[resource]
      .get(id)
      .end( (err, res) => {
        err
          ? reject(err)
          : resolve(res);
      });
  });
  return yield promise.then( response => ({body: response.body, error: null}) )
                      .catch( error => ({error}) );
}

export function *_requestPage(resource, page, query={}, pageSize=20) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi[resource]
      .list()
      .page(page, pageSize)
      .query(query)
      .end( (err, res) => {
        err
          ? reject(err)
          : resolve(res);
      });
  });

  return yield promise.then( response => ({body: response.body, error: null}) )
                                .catch( error => ({error: error}) );
}

export function *_writeStubs(resource, response) {
  /**
   * Writes the stubs to the store
   */
  const { results } = response;

  for(let i=0; i<results.length; i++) {
    const resourceItem = yield select(selectItem, resource, results[i].id);

    if( ! resourceItem ) {
      yield put(writeStub(resource, results[i].id, results[i]))
    }
  }
}

export function *_writeResources(resource, response, related) {
  /**
   * Read the actual resource only if it's a stub and write to the store.
   */
  const { results } = response;

  for(let i=0; i<results.length; i++) {
    const resourceItem = yield select(selectItem, resource, results[i].id);

    if( resourceItem && resourceItem.stub ) {
      yield put(getResource(resource, results[i].id, related))
    }
  }
}

function *_writeSubStubs(parentResource, entities){

  // loop over all sub resources, but not the parent resource
  delete entities[parentResource];

  for( const entity of Object.keys(entities)){
    for ( const id of Object.keys(entities[entity])){
      const resourceItem = yield select(selectItem, entity, id);
      if( ! resourceItem ) {
        yield put(writeStub(entity, id, entity[id]))
      }
    }
  }
}

function *_getSubResources(schema, entities, related){
  for (const resource of Object.keys(related)) {
    let resourceName = null;

    if ( entities.hasOwnProperty(resource) ){
      resourceName = resource;
    } else if( schema.hasOwnProperty(resource) && entities.hasOwnProperty(schema[resource]._key) ) {
      resourceName = schema[resource]._key
    }

    if (resourceName) {
      for (const id of Object.keys(entities[resourceName])) {
        yield put(getResource(resourceName, id, related[resource]))
      }
    }
  }
}

function *_writeResponse(response, resource, id, getRelated={}){
  /**
   * Write the resource sub resource's response to the store
   * Also, if other resources listed in `getRelated` make a request for those
   */
  const normalized = normalize(response, schemas[resource]);
  yield put(writeResource(resource, id, normalized.entities[resource][id]));
  yield *_writeSubStubs(resource, normalized.entities);

  if (getRelated) {
    yield *_getSubResources(schemas[resource], normalized.entities, getRelated)
  }
}

export function* _getResource(action) {
  /**
   * As long as a sub-resource is marked by the schema, it'll be writen to the store as
   * a stub. To retrieve the actual child resource the resource names must be passed in `action.getRelated`
   */


  if( ! action.force) {
    const item = yield select(selectItem, action.resource, action.id);
    if( item && item.hasOwnProperty('stub') && !item.stub)
      return;
  }

  const response  = yield *_requestItem(action.resource, action.id);

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }

  yield _writeResponse(response.body, action.resource, action.id, action.getRelated);
}


export function* _listResource(action){
  /**
   * Will read the list page of a resource from gapi and write the stub info.
   * In a second attempt, will try to request the actual resource one by one.
   * each `_write...` process makes sure the data isn't already available in the store
  **/

  // // Don't make a request if page is already loaded
  // const pagination = yield select(selectPagination, action.resource, action.paginationKey);
  // if( pagination && pagination.pages.hasOwnProperty(action.page) ) {
  //   yield put(changePage(action.resource, action.paginationKey, action.page))
  //   return
  // }

  const response = yield *_requestPage(action.resource, action.page, action.query, action.pageSize);

  if ( response.error ) {
    // TODO: This is for a single Fail
    yield put(listResourceFail(action.resource, action.paginationKey, action.id, response.error));
    return;
  }

  // TODO: use normalized data instead
  const normalized = normalize(response.body.results, arrayOf(schemas[action.resource]));
  const keys = normalized.result.length ? Object.keys(normalized.entities[action.resource]) : [];

  yield put(writePagination(action.resource, action.paginationKey, keys, response.body.count, response.body.current_page, response.body.max_per_page, action.query));
  yield* _writeStubs(action.resource, response.body);
  yield* _writeResources(action.resource, response.body, action.getRelated);
}

export function* _allResource(action){
  /**
   * Will gather items from all pages of a resource.
   * Good for base/core resources like countries, states, or places
   * e.g Drop downs in forms need access to all items in a resource and not just one page
   * Not the best for large resource
   *
   * Looks pretty much like _listResource except for the loop and the fact that
   * it will not write pagination to the store.
  **/
  const pageSize = 50;
  let page = 1;

  // while a "next page" exists
  while(true){
    const response = yield *_requestPage(action.resource, page, {}, pageSize);

    if ( response.error ) {
      // TODO: This is for a single Fail
      yield put(listResourceFail(action.resource, action.paginationKey, action.id, response.error));
      break;
    }

    // TODO: use normalized data instead
    // const normalized = normalize(response.body.results, arrayOf(schemas[action.resource]));
    yield* _writeStubs(action.resource, response.body);
    yield* _writeResources(action.resource, response.body, action.getRelated);

    if ( _hasNext(response.body ))
      page++;
    else
      break;
  }
}

export function *_createResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
        .post()
        .send(action.data)
        .end( (err, res) => {
          err
            ? reject(err)
            : resolve(res);
        });
  });

  const response = yield promise.then( response => ({body: response.body, error: null}) )
                                .catch( error => ({error: error}) );

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }

  yield *_writeResponse(response, action.resource, response.id);
  yield put(clearPagination(action.resource));
}

export function *_updateResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
        .patch(action.id)
        .send(action.data)
        .end( (err, res) => {
          err
            ? reject(err)
            : resolve(res);
        });
  });

  const response = yield promise.then( response => ({body: response.body, error: null}) )
                                .catch( error => ({error: error}) );

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }

  yield *_writeResponse(response.body, action.resource, action.id);
}

export function *_deleteResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
        .del(action.id)
        .end( (err, res) => {
          err
            ? reject(err)
            : resolve(res);
        });
  });

  const response = yield promise.then( response => ({body: response.body, error: null}) )
                                .catch( error => ({error: error}) );

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
  }
}

export default function* () {
  yield [
    takeEvery( GET_RESOURCE,    _getResource ),
    takeEvery( LIST_RESOURCE,   _listResource ),
    takeEvery( ALL_RESOURCE,    _allResource ),
    takeEvery( UPDATE_RESOURCE, _updateResource ),
    takeEvery( CREATE_RESOURCE, _createResource ),
    takeEvery( DELETE_RESOURCE, _deleteResource )
  ]
}
