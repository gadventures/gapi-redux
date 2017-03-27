const Gapi = require('gapi-js');

const g = new Gapi({ key: 'test_29fb8348e8990800ad76e692feb0c8cce47f9476'});

g.countries.order('name').list().end( (error, response) => {
    if( error ) {
        console.error(error);
    }else{
      console.log(JSON.stringify(response.body));
    }
});
