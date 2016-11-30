import {takeEvery} from 'redux-saga';
import { put, select } from 'redux-saga/effects'
import {normalize, arrayOf} from 'normalizr';
import Gapi from './gapi-client';
import {schemas} from './schemas';

import {GET_RESOURCE, LIST_RESOURCE, UPDATE_RESOURCE, CREATE_RESOURCE} from './actionTypes';

import {
  getResource, getResourceFail,
  writePagination, writeStub, writeResource
} from './actions';

import {selectItem} from './selectors';

// TODO: Error Handling
// TODO: For loops

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

function *_requestPage(resource, page, query={}, pageSize=20) {
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

function *_getSubResources(entities, related){
    for (const resource of Object.keys(related)) {
      if (entities.hasOwnProperty(resource)) {
        for (const id of Object.keys(entities[resource])) {
          yield put(getResource(resource, id, related[resource]))
        }
      }
    }
}

function *_writeResponse(response, action){
  /**
   * Write the resource sub resource's response to the store
   * Also, if other resources listed in `getRelated` make a request for those
   */
  const normalized = normalize(response.body, schemas[action.resource]);
  yield put(writeResource(action.resource, action.id, normalized.entities[action.resource][action.id]));
  yield *_writeSubStubs(action.resource, normalized.entities);

  if (action.getRelated)
    yield *_getSubResources(normalized.entities, action.getRelated, )
}

export function* _getResource(action) {
  /**
   * As long as a sub-resource is marked by the schema, it'll be writen to the store as
   * a stub. To retrieve the actual child resource the resource names must be passed in `action.getRelated`
   */


  if( ! action.force) {
    const item = yield select(selectItem, action.resource, action.id);
    if( item && ! item.stub)
      return;
  }

  const response  = yield *_requestItem(action.resource, action.id);

  if ( response.error ) {
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }

  yield _writeResponse(response, action);
}


export function* _listResource(action){
  /**
   * Will read the list page of a resource from gapi and write the stub info.
   * In a second attempt, will try to request the actual resource one by one.
   * each `_write...` process makes sure the data isn't already available in the store
  **/
  const response = yield *_requestPage(action.resource, action.page, action.query, action.pageSize);

  if ( response.error ) {
    // TODO: This is for a single Fail
    yield put(getResourceFail(action.resource, action.id, response.error));
    return;
  }

  // TODO: use normalized data instead
  const normalized = normalize(response.body.results, arrayOf(schemas[action.resource]));
  const keys = normalized.result.length ? Object.keys(normalized.entities[action.resource]) : [];

  yield put(writePagination(action.resource, keys, response.body.count, response.body.current_page, response.body.max_per_page))
  yield* _writeStubs(action.resource, response.body);
  yield* _writeResources(action.resource, response.body, action.getRelated);
}

export function *_createResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi.country_dossiers
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
  yield *_writeResponse(response, action);
}

export function *_updateResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi.country_dossiers
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
  yield *_writeResponse(response, action);
}

export default function* () {
  yield [
    takeEvery( GET_RESOURCE,    _getResource ),
    takeEvery( LIST_RESOURCE,   _listResource ),
    takeEvery( UPDATE_RESOURCE, _updateResource ),
    takeEvery( CREATE_RESOURCE, _createResource )
  ]
}
