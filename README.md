gapi-redux
==========

A redux client for [Gapi]().

**Still in alpha phase**

Requirements
------------

* [redux]()
* [redux-sagas]()
* [gapi-js](https://github.com/gadventures/gapi-js)

Why
---
`gapi-redux` will take care of ...

...


Documentation
-------------
* [Getting Started](#getting-started)
* [Actions](#actions)
    * [`getResource()`](#getresourceresourcename-resourceid--getrelated--forcefalse)
    * [`listResource()`](#listresource)
    * [`allResource()`](#allresource)
    * [`createResource()`](#createresource)
    * [`updateResource()`](#updateresource)
    * [`deleteResource()`](#deleteresource)
    * [Data Availability](#data-availability)    
* [Selectors](#selectors)
    * [`selectItem`]()
    * [`selectPage`]()
    * [`selectCurrentPage`]()
    * [`selectAll`]()
    * [`selectAllPages`]()
    * [`selectPagination`]()
* Pagination
* Fetching


### Getting Started

Add `gapi-redux`'s reducer and sagas to your reducer and sagas respectively

your-reducers.js
```javascript
import {combineReducers} from 'redux';
import gapiReducers from 'gapi-redux';

export default = combineReducers({
  ...gapiReducers
  ...yourReducers,
})
```

your-sagas.js
```javascript
import {fork} from 'redux-saga/effects';
import gapiSagas from 'gapi-redux';

export default function *sagas() {
  yield [
    fork(gapiSagas),
    fork(yourSagas)
  ];
```


And finally in your code you'd introduce the reducers and sagas to redux, as you'd normally do.

```javascript
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga';

import reducers from './your-reducers';
import sagas from './your-sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(sagas);
```

And your're all set. Any gapi-redux actions you dispatch will now be caught by the reducers and sagas.
  


Actions
-------

### `getResource(resourceName, resourceId [, getRelated={} [, force=false]])`
Will attempt to retrieve a single resource from gapi. gapi-redux will then either dispatch a  

```javascript
// Request a single resource
store.dispatch(getResource('places', 123)) // get place w/ id 123

// Will also make a request for the related country to this resource
store.dispatch(getResource('places', 123, {countries: null }))

// After requesting the place associated with each place dossier,
// will then attempt to make a request for each country associated with each place
store.dispatch(getResource('place_dossiers', 123, {places: {countries: null }}))  
```

### `listResource(resourceName, paginationKey [, page=1 [, query={} [, getRelated={} [, pageSize=20]]]])`

Will retrieve one page of the resource and save it in the store under the given paginationKey.

`getRelated` and how it works:

[Why is `paginationKey` is required](#paginationkey)

```javascript
// Request the first page
store.dispatch(listResource('countries', 'myCountries')) 

store.dispatch(listResource('places', 'listOfPlaces`), 1, {}, {countries: null})
```



Internal Action
---------------
## getResourceFail

## listResourceFail


Data Availability
-----------------

When dispatching `getResource()`, `listResource()`, and `allResource()` the actual resource and it's children will be added to the store through multiple requests. And in each request part of the data will be written to the store

This allows ....
 
`getResource()`
1. gapi-redux makes a request for the actual resource
2. Any child resources marked by schemas will be moved to their own resource branch in the store
3. If `getRelated` made a request for that child resource, a separate `getResource()` call is made for the child.
4. Repeat step 1 for child resources.

`listResource()`
1. Make a request for the list endpoint of a resource. The returned result will hold pagination information along the a list of stubs.
2. Write the pagination information
3. Write the list of stubs to the store in one go.
4. Dispatch `getResource()` for each stub in the list.
5. Go through all steps of `getResource()` for each stub.

`allResource()`
1. Make a request for the first page of a resource. The page size is set to 50.
2. Write stubs to the store in one go.
3. Dispatch `getRelated()` for each stub in the list.
4. Go through all steps of `getResource()` for each stub.
5. Make a request for the next page if available.


Selectors
---------
* selectItem
* selectPage
* selectCurrentPage
* selectAll
* selectAllPages
* selectPagination

Pagination Key
--------------
