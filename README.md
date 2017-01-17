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
You made a redux app that connects to Gapi and now you have all sorts of actions like `REQUEST_PLACE_DOSSIER` and `REQUEST_ITINERARY` and the list keeps growing as you move forward.
You're also worried about resources that you've already requested, are you fetching them again? Do you need more actions to request the child resources? 
 
It would've been easier if you had an action creator that just did `getResource('place_dossiers', 123)`.
And it would've been smart enough to handle your pagination and all the duplicate requests different components in your project make, and knew how to drill down to make separate requests for the children, right?

Well if that's you, you've come to the right place. Keep on reading.

Documentation
-------------
* [Getting Started](#getting-started)
* [Actions](#actions)
    * [`getResource()`](#getresourceresourcename-resourceid--getrelated--forcefalse)
    * [`listResource()`](#listresourceresourcename-paginationkey--page1-query--pagesize20)
    * [`allResource()`](#allresource)
    * [`createResource()`](#createresource)
    * [`updateResource()`](#updateresource)
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
Actions will help load data into your store. [`Selectors`](#selectors) will allow you to read the loaded data. 

No matter how many times or through what action a resource is requested, gapi-redux will only request that resource once. All other requests will be ignored

#### `getResource(resourceName, resourceId [, getRelated={} [, force=false]])`
Will attempt to retrieve a single resource from gapi.  

```javascript
// Request a single resource
store.dispatch(getResource('places', 123)) // get place w/ id 123

// Will also make a request for the related country to this resource
store.dispatch(getResource('places', 123, {country: null }))

// After requesting the place associated with each place dossier,
// will then attempt to make a request for each country associated with each place
store.dispatch(getResource('place_dossiers', 123, {place: {country: null }}))  
```
* `resourceName`
**Required** The name of the resource to request

* `resourceId`
**Required** The id of the resource to request

* `getRelated`
By default when requesting a resource, any child resources present will be marked as stubs. `getRelated` is used to make deep requests for those child stubs.
The `getRelated` object can include multiple keys. `getResource` will attempt to request all the given resources after the main resource has been retrieved.
The value of each key can either be `null` or another object containing more resource keys.

```javascript
store.dispatch(getResource('dossiers', 10, {accommodation_dossiers: {primary_country: null, location: {country: null}}}))               
```

The above action will result the store to look like this:

[[]]

* `force`
By default gapi-redux will deny requesting a resource that has already been loaded to the store. Passing `true` will force `getResource` to make a request whether it exists or not.  


#### `listResource(resource, paginationKey [, page=1 [, query={} [, getRelated={} [, pageSize=20]]]])`

Will retrieve one page of the resource and save it in the store under the given paginationKey.

```javascript
// Request the first page
store.dispatch(listResource('countries', 'myCountries')) 

// After retrieving the list of places, will request each place's related country and save it in the store. 
store.dispatch(listResource('places', 'listOfPlaces'), 1, {}, {country: null})
```

* `resource`
**Required** The name of the resource to request

* `paginationKey` 
**Required** On resource should be allowed to have multiple paginations. Lets say you have a form field component with search and filtering capabilities. One form might decide to use that component for more than one of it's fields. The search results (pagination) for each component, shouldn't affect the results in the other filed component. More importantly, neither should affect the list view page for that resource.
Passing a `paginationKey` will allow the same resource to have multiple paginations.

* `page`
Page number to request

* `query`
Any query to pass to Gapi

* `getRelated`
Request related resources for each item in the list after the retrieving the main resource 


#### allResource(resource, query={}, getRelated={}, getStubs=true)

Request every item in a resource. `allResource` will make separate calls to each page of a resource. Depending on the resource, this can sometimes take long time to complete. Use with caution.  

* `resource`
The name of the resource

* `query`
Any query to pass to Gapi

* `getRelated`
Request related resources for each item in the list after the retrieving the main resource

* `getStubs`
In most cases when using `allResource`, collecting only the stubs would suffice. Passing `false` can help speedup the request process. This value is `true` by default.

#### `createResource(resource, [data={}, [resolve, [reject]]])`

#### `updateResource(resource, id, [data={}, [resolve, [reject]]])`

Data Availability
-----------------

When dispatching `getResource()`, `listResource()`, and `allResource()` the actual resource and it's children will be added to the store through multiple requests. In each request, part of the data will be written to the store

This allows for gradually displaying results, to the user, as they load. While the user is presented with the base data, related resources will be slowly loaded into the page.
 
#### `getResource()`
   1. Request the actual resource
   2. Any child resources marked by schemas will be moved to their own resource branch in the store
   3. If `getRelated` made a request for that child resource, a separate `getResource()` call is made for the child.
        4. Repeat step 1 for child resources.

#### `listResource()`
   1. Make a request for the list endpoint of a resource. The returned result will hold pagination information along the a list of stubs.
   2. Write the pagination information
   3. Write the list of stubs to the store in one go.
   4. Dispatch `getResource()` for each stub in the list.
   5. Go through all steps of `getResource()` for each stub.

#### `allResource()`
   1. Make a request for the first page of a resource. The page size is set to 50.
   2. Write stubs to the store in one go.
   3. Dispatch `getRelated()` for each stub in the list.
   4. Go through all steps of `getResource()` for each stub.
   5. Make a request for the next page if available.


Selectors
---------
#### selectItem
#### selectPage
#### selectCurrentPage
#### selectAll
#### selectAllPages
#### selectPagination

Pagination Key
--------------