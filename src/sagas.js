import {takeEvery} from 'redux-saga';
import { call, put, select } from 'redux-saga/effects'
import {normalize} from 'normalizr';
import Gapi from './gapi-client';

import {GET_RESOURCE, LIST_RESOURCE,} from './actionTypes';

import {
  getResource, getResourceFail,
  writePagination, writeStub, writeResource
} from './actions';

import {selectItem} from './selectors';

// TODO: Error Handling
// TODO: For loops

export function *_writePagination(resource, response) {
  /**
  * Write pagination info to the store
  **/
  const ids = [];
  for(let i=0; i<response.results.length; i++) {
    ids.push(response.results[i].id);
  }
  yield put(writePagination(resource, ids, response.count, response.current_page, response.max_per_page))
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

export function *_writeResources(resource, response) {
  /**
   * Read the actual resource only if it's a stub and write to the store.
   */
  const { results } = response;

  for(let i=0; i<results.length; i++) {
    const resourceItem = yield select(selectItem, resource, results[i].id);
    if( resourceItem.stub ) {
      yield put(getResource(resource, results[i].id, results[i]))
    }
  }
}

export function* _getResource(action) {
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});
  const method = gapi[action.resource].get;

  try {
    const response = yield call([gapi, method], action.id);
    // TODO: Normalize Response
    yield put(writeResource(action.resource, action.id, response.body));

  } catch (error) {

    yield put(getResourceFail());
  }
}


export function* _listResource(action){
  /**
   * Will read the list page of a resource and write the stub info already present.
   * In a second attempt, will try to request the actual resource one by one.
   * each `_write...` process makes sure the data isn't already available
  **/
  const gapi = new Gapi({key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

  const promise = new Promise( (resolve, reject) => {
    gapi[action.resource]
      .list()
      .page(action.page, action.pageSize)
      .query(action.query)
      .end( (err, res) => {
        err
          ? resolve(err)
          : resolve(res);
      });
  });

  const response = yield promise.then( response => response ).catch( error => {
    throw Error(error);
  });

  yield* _writePagination(action.resource, response.body);
  yield* _writeStubs(action.resource, response.body);

  if( action.deep)
    yield* _writeResources(action.resource, response.body);
}

export default function* () {
  yield [
    takeEvery(GET_RESOURCE, _getResource),
    takeEvery(LIST_RESOURCE, _listResource)
  ]
}
