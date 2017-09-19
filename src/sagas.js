import {takeEvery} from 'redux-saga';
import { put, select, call } from 'redux-saga/effects'
import { normalize } from 'normalizr';
import Gapi from 'gapi-js';
import {schemas} from './schemas';
import _ from 'lodash';

import {
  GET_RESOURCE, LIST_RESOURCE, ALL_RESOURCE,
  UPDATE_RESOURCE, CREATE_RESOURCE,
  DELETE_RESOURCE
} from './actionTypes';

import {
  getResource, getResourceFail,
  listResourceFail,
  updateResourceFail, createResourceFail,
  writePagination, writeStub, writeResource,
  clearPagination
} from './actions';

import {selectItem} from './selectors';

// TODO: Error Handling
// TODO: For loops

export const getActualResourceName = (resourceName, normalized, subResource) => {
  /**
   * Using the schema, returns the actual resource name inside the normalized entities.
   * e.g.:
   *   `start_location` in `transport_dossiers.start_location` is actually a `places` resource.
   *   So it'll return "places"
   */
  const schema = schemas[resourceName].schema;
  if( _.has(schema, subResource) && _.has(normalized, _.get(schema, subResource)._key) ) {
     return _.get(schema, subResource)._key
  } else if ( _.has(normalized, subResource) ){
    return subResource;
  }
};

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

function *_requestItem(resource, id, conf) {
  /**
   * Makes a request for a single object from gapi.
   */ 
  const gapi = new Gapi(conf);
  const promise = new Promise( (resolve, reject) => {
    gapi[resource]
      .get(id)
      .end( (err, res) => {
        err
          ? reject(err)
          : resolve(res);
      });
  });
  return yield promise.then( response => response )
                      .catch( error   => ({error: error.response}) );
}

export function *_requestPage(resource, page, query={}, pageSize=20, orderBy=[], conf) {
  const gapi = new Gapi(conf);

  const promise = new Promise( (resolve, reject) => {
    gapi[resource]
      .list()
      .order(...orderBy)
      .page(page, pageSize)
      .query(query)
      .end( (err, res) => {
        err
          ? reject(err)
          : resolve(res);
      });
  });

  return yield promise.then( response => ( response ) )
                      .catch( error   => ({error: error.response}) );
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

export function *_writeResources(resource, response, getRelated) {
  /**
   * Read the actual resource only if it's a stub and write to the store.
   */
  const { results } = response;

  for(let i=0; i<results.length; i++) {
    const resourceItem = yield select(selectItem, resource, results[i].id);

    if( resourceItem && resourceItem.stub ) {
      yield put(getResource(resource, results[i].id, { getRelated }))
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
        yield put(writeStub(entity, id, entities[entity][id]))
      }
    }
  }
}

function *_getSubResources(resourceName, entities, related){
  for (const subResource of Object.keys(related)) {
    const actualResourceName = getActualResourceName(resourceName, entities, subResource);
    if (actualResourceName) {
      for (const id of Object.keys(entities[actualResourceName])) {
        yield put(getResource(actualResourceName, id, { getRelated: related[subResource] }))
      }
    }
  }
}

function *_writeResponse(response, resource, id, getRelated={}, requestType, responseCode){
  /**
   * Write the resource sub resource's response to the store
   * Also, if other resources listed in `getRelated` make a request for those
   */
  const normalized = normalize(response, schemas[resource]);
  yield put(writeResource(resource, id, normalized.entities[resource][id], requestType, responseCode));
  yield *_writeSubStubs(resource, normalized.entities);

  if (getRelated) {
    yield *_getSubResources(resource, normalized.entities, getRelated)
  }
}

//////////////////////////////////////////////
////////////// Action Handelers //////////////
//////////////////////////////////////////////

export function* _getResource(conf, action) {
  /**
   * As long as a sub-resource is marked by the schema, it'll be writen to the store as
   * a stub. To retrieve the actual child resource the resource names must be passed in `action.getRelated`
   */

  if( ! action.force) {
    const item = yield select(selectItem, action.resource, action.id);
    if( item && item.hasOwnProperty('stub') && !item.stub)
      return;
  }

  const response  = yield *_requestItem(action.resource, action.id, conf);

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }
  yield _writeResponse(response.body, action.resource, action.id, action.getRelated, 'get', response.status);
}

export function* _listResource(conf, action){
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

  const response = yield *_requestPage(action.resource, action.page, action.query, action.pageSize, action.orderBy, conf);

  if ( response.error ) {
    // TODO: This is for a single Fail
    yield put(listResourceFail(action.resource, action.paginationKey, action.id, response.error));
    return;
  }

  // TODO: use normalized data instead
  const normalized = normalize(response.body.results, [schemas[action.resource]]);
  const keys = normalized.result;

  yield put(writePagination(action.resource, action.paginationKey, keys, response.body.count, response.body.current_page, response.body.max_per_page, response.statusCode));
  yield* _writeStubs(action.resource, response.body);
  yield* _writeResources(action.resource, response.body, action.getRelated);
}

export function* _allResource(conf, action){
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
    const response = yield *_requestPage(action.resource, page, action.query, pageSize, action.orderBy, conf);

    if ( response.error ) {
      // TODO: This is for a single Fail
      yield put(listResourceFail(action.resource, action.paginationKey, action.id, response.error));
      break;
    }

    // TODO: use normalized data instead
    // const normalized = normalize(response.body.results, arrayOf(schemas[action.resource]));
    yield* _writeStubs(action.resource, response.body);

    if( action.getStubs )
      yield* _writeResources(action.resource, response.body, action.getRelated);

    if ( _hasNext(response.body ))
      page++;
    else
      break;
  }
}

export function *_createResource(conf, action) {
  const gapi = new Gapi(conf);

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
        .post()
        .send(action.data)
        .end( (err, res) => { err ? reject(err) : resolve(res);});
  });

  const response = yield promise.then( response => response )
                                .catch( error => ({error: error.response}) );
  if ( response.error ) {
    action.reject ? yield call(action.reject, response.error.body) : null;
    yield put(createResourceFail(action.resource, response.error));
    return;
  }
  action.resolve ? yield call(action.resolve, response): null;
  yield *_writeResponse(response.body, action.resource, response.body.id, {}, 'post', response.status);
  yield put(clearPagination(action.resource));
}

export function *_updateResource(conf, action) {
  const gapi = new Gapi(conf);

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
        .patch(action.id)
        .send(action.data)
        .end( (err, res) => { err ? reject(err) : resolve(res); });
  });

  const response = yield promise.then( response => response )
                                .catch( error   => ({error: error.response}) );
  if ( response.error ) {
    action.reject ? yield call(action.reject, response.error.body) : null;
    yield put(updateResourceFail(action.resource, action.id, response.error));
    return;
  }
  action.resolve ? yield call(action.resolve, response): null;
  yield *_writeResponse(response.body, action.resource, action.id, {}, 'patch', response.status);
}

export function *_deleteResource(conf, action) {
  const gapi = new Gapi(conf);

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

export default function* (conf) {
  yield [
    takeEvery( GET_RESOURCE,    _getResource,    conf ),
    takeEvery( LIST_RESOURCE,   _listResource,   conf ),
    takeEvery( ALL_RESOURCE,    _allResource,    conf ),
    takeEvery( UPDATE_RESOURCE, _updateResource, conf ),
    takeEvery( CREATE_RESOURCE, _createResource, conf ),
    takeEvery( DELETE_RESOURCE, _deleteResource, conf )
  ]
}
