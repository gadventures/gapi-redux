gapi-redux
==========

A redux client for [Gapi]().

> **Still in alpha phase**

Requirements
------------

* [redux](https://github.com/reactjs/redux)
* [redux-sagas](https://github.com/redux-saga/redux-saga)
* [gapi-js](https://github.com/gadventures/gapi-js)

`React` is *not* a requirement for gapi-redux and can be used with any js library.

Why
---
You made a redux app that connects to Gapi and now you have all sorts of actions like `REQUEST_PLACE_DOSSIER` and `REQUEST_ITINERARY` and the list keeps growing as you move forward. You're also worried about resources that you've already requested, are you fetching them again? Do you need more actions to request the child resources? 
 
It would've been easier if you had an action creator that just did `getResource('place_dossiers', 123)`.
And it would've been smart enough to handle your pagination and all the duplicate requests different components in your project make, and knew how to drill down to make separate requests for the children, right?

Well if that's you, you've come to the right place. Keep on reading.

Documentation
-------------
* [Getting Started](#getting-started)
* [Actions](#actions)
    * [`getResource()`](#getresourceresourcename-resourceid--getrelated--forcefalse)
    * [`listResource()`](#listresourceresource-paginationkey--page1--query--getrelated--pagesize20)
    * [`allResource()`](#allresourceresource-query-getrelated-getstubstrue)
    * [`createResource()`](#createresourceresource-data-resolve-reject)
    * [`updateResource()`](#updateresourceresource-id-data-resolve-reject)
    * [Data Availability](#data-availability)    
* [Selectors](#selectors)
    * [`selectItem`](#selectitemstate-resource-id)
    * [`selectPage`](#selectpagestate-resource-paginationkey-page)
    * [`selectCurrentPage`](#selectcurrentpagestate-resource-paginationkey)
    * [`selectAll`](#selectallstate-resource-orderkeynull-rawfalse)
    * [`selectAllPages`](#selectallpagesstate-resource-paginationkey-rawfalse)
    * [`selectPagination`](#selectpaginationstate-resource-paginationkey)


### Getting Started

Add `gapi-redux`'s reducer and sagas to your reducer and sagas respectively

#### `your-reducers.js`
```javascript
import {combineReducers} from 'redux';
import gapiReducers from 'gapi-redux';

export default = combineReducers({
  ...gapiReducers
  ...yourReducers,
})
```

#### `your-sagas.js`
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
No matter how many times or through what action a resource is requested, gapi-redux will only request that resource once. All other requests will be ignored

Using [normalizer](), all resources will be normalized before saving to the store. 


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

##### Arguments
* **`resourceName`**`: String [required]`

  The name of the resource to request

* **`resourceId`**`: Number [required]`

  The id of the resource to request

* **`getRelated`**`: Object`

  By default when requesting a resource, any child resources present will be marked as stubs. `getRelated` is used to make deep requests for those child stubs.
The `getRelated` object can include multiple keys. `getResource` will attempt to request all the given resources after the main resource has been retrieved.
The value of each key can either be `null` or another object containing more resource keys.

```javascript
store.dispatch(getResource('dossiers', 10, {accommodation_dossiers: {primary_country: null, location: {country: null}}}))               
```

The above action will result the following state:

![The Store](/docs/media/store.png?raw=true "The Store")

Notice that we only made a request for dossier 10, but `getRelated` is making additional requests to all related resources for the current dossier and after normalizing the data, saves them to the store. Also, since `features` was not included in `getRelated`, it is marked as stub.

* **`force`**`: Boolean [default=false]`
By default gapi-redux will deny requesting a resource that has already been loaded to the store. Passing `true` will force `getResource` to make a request whether it exists or not.  


#### `listResource(resource, paginationKey [, page=1 [, query={} [, getRelated={} [, pageSize=20]]]])`

Will retrieve one page of the resource and save it in the store under the given paginationKey.

```javascript
// Request the first page
store.dispatch(listResource('countries', 'myCountries')) 

// After retrieving the list of places, will request each place's related country and save it in the store. 
store.dispatch(listResource('places', 'listOfPlaces'), 1, {}, {country: null})
```
##### Arguments
* **`resource`**`: String [required]`

  The name of the resource to request

* **`paginationKey`**` : String [required]`

  A resource should be allowed to have multiple paginations. Lets say you have a form field component with search and filtering capabilities. One form might decide to use that component for more than one of it's fields. The search results (pagination) for each component, shouldn't affect the results in the other filed component. More importantly, neither should affect the list view page for that resource.
  Passing a `paginationKey` will allow the same resource to have multiple paginations.

* **`page`**` : Number [default=1]`

  Page number to request

* **`query`**` : Object`

  Any query to pass to Gapi

* **`getRelated`**` : Object`

  Request related resources for each item in the list after the retrieving the main resource 


#### `allResource(resource, query={}, getRelated={}, getStubs=true)`

Request every item in a resource. `allResource` will make separate calls to each page of a resource. Depending on the resource, this can sometimes take long time to complete. Use with caution.  

##### Arguments
* **`resource`**` : String [required]`

  The name of the resource

* **`query`**` : Object`

  Any query to pass to Gapi

* **`getRelated`**`: Object`

  Request related resources for each item in the list after the retrieving the main resource

* **`getStubs`**`: Boolean [default=true]`

  In most cases when using `allResource`, collecting only the stubs would suffice. Passing `false` can help speedup the request process.   This value is `true` by default.

#### `createResource(resource, [data={}, [resolve, [reject]]])`
Creates a single resource.

You can wrap `createResource` in a promise. It'll call `resolve` and `reject` accordingly

```javascript
const p = new Promise( (resolve, reject) => {
 store.dispatch( createResource('place_dossier', {some data...}, resolve, reject);
}).then(
 ( response => { /* do something with the response */ },
 ( error    => { /* do something with the error */ }
)
```

#### `updateResource(resource, id, [data={}, [resolve, [reject]]])`

Updates a single resource.

You can wrap `updateResource` in a promise. It'll call `resolve` and `reject` accordingly

#### Data Availability

When dispatching `getResource()`, `listResource()`, and `allResource()` the actual resource and it's children will be added to the store through multiple requests. In each request, part of the data will be written to the store

This allows for gradually displaying results, to the user, as they load. While the user is presented with the base data, related resources will be slowly loaded into the page.
 
##### `getResource()`
   1. Request the actual resource
   2. Any child resources marked by schemas will be normalized and moved to their own resource branch in the store
   3. If `getRelated` made a request for a child resource, a separate `getResource()` call is made for the child. Repeat step 1 for child resources.

##### `listResource()`
   1. Make a request for the list endpoint of a resource. The returned result will hold pagination information along with a list of stubs.
   2. Write the pagination information
   3. Write the list of stubs to the store in one go.
   4. Dispatch `getResource()` for each stub in the list. Repeat all steps of `getRealted` for each resource.

##### `allResource()`
   1. Make a request for the first page of a resource. The page size is set to 50.
   2. Write stubs to the store in one go.
   3. Dispatch `getRelated()` for each stub in the list. Repeat all steps of `getRealted` for each resource.
   5. Make a request for the next page if available.


Selectors
---------


#### `selectItem(state, resource, id)`
Selects a single item from the store. Will return `null` if not found.

> **Important**
> Using [normalizr](), all requests to Gapi will be normalized before saving to the store. `selectItem` will return a denormalized version of your resource.  

```javascript
// requesting the place and place.country in `getRelated`
store.dispatch(getResource('place_dossiers', 123, {place: {country: null}}))
//...
const state = store.getState();
const dossier = selectItem(state, 'place_dossiers', 123);

// Selectors will return denormalized data. 
console.log(dossier.place.country.name) // The name of the country
console.log(dossier.segment.name)       // Null.

// `segment` was never requested by either `getRelated` or any other action. It's just stub data.

```

#### `selectPage(state, resource, paginationKey, page)`
Selects all resource items in one page and returns a denormalized version of each. Returns an array of items.
   
#### `selectCurrentPage(state, resource, paginationKey)`
Selects all resource items in the current page. Technically this function should be used within your components, instead of `selectPage`. The pagination already knows which page to display. Returns an array of items.


#### `selectAll(state, resource, orderKey=null, raw=false)`
Selects all items currently available in the store. This does not necessarily reflect all items in Gapi, only what the action have loaded into the store. Returns an array of items if `raw=false`.

* `orderKey`: Order the resource based on one of it's keys
* `raw`: if `true`, the selector will not attempt to convert the data to an array, and will return the exact format saved in the store.

#### `selectAllPages(state, resource, paginationKey, raw=false)`
Like `selectALl` will return all loaded resources, but under a certain `paginationKey`. Possible use cases are for pages where each page of data loads after scrolling to the bottom or by clicking on a "Load More" button.

#### `selectPagination(state, resource, paginationKey)`
Selects the pagination info of a resource/paginationKey combination.


```javascript

store.dispatch(listResource('place_dossiers', 'aKey', 1, {}, {}, 3); // Request page 1, with a page size of 3
store.dispatch(listResource('place_dossiers', 'aKey', 2, {}, {}, 3); // Request the 2nd page.
...
const state = store.getState(); 
const pagination = selectPagination(state, 'place_dosiers', 'aKey');
console.log(pagination)

... 
{
    fetching: false
    totalCount: 1000 // The number of total items this resource has
    currentPage: 2   // The second page was the last requested page by the actions
    pageSize: 3
    pages: {
      1:   [ 1, 2, 3 ], // resource ids of items in page 1
      2:   [ 4, 5, 6 ]  // resource ids of items in page 2
      all: [ 1, 2, 3, 4, 5, 6  ], // all ids currently loaded by the store
    }
}
```
