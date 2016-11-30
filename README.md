gapi-redux
==========

A redux client for [Gapi](). This project uses `redux` and `redux-sagas`

**Still in alpha phase**

Requirements
------------

* [redux]()
* [redux-sagas]()
* [superagent]()
* [gapi-js](https://github.com/gadventures/gapi-js)

Why
---

`gapi-redux` will take care of ...

How to use
----------

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

Available Actions
-----------------

**getResource(resourceName, resourceId [, getRelated={} [, force=false]])**
Will attempt to retrieve a single resource from gapi.

```javascript
store.dispatch(getResource('places', 123)) // get place w/ id 123
```

**listResource(resourceName [, page=1 [, query={} [, getRelated={} [, pageSize=20]]]])**

Will retrieve one page of the resource with the given pageSize.

```javascript
store.dispatch(listResource('countries')) // page 1 of countries, default pageSize is 20
```

Process of Requesting Data and Saving to the Store
--------------------------------------------------
It's important to understand how the data is retrieved from gapi and saved in the store. This will help you understand when a piece of data is available and ready for use. Requests to gapi can either be made to a list page (e.g. `/countries/`) or a detail page (e.g. `/countries/CA/`). 

**Requesting a Single Item**



**Requesting a Page**


