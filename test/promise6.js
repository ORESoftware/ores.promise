
const {Promise} = require('../dist/main');

const z = Promise.resolve(null).then(v => {
  throw 'fart';
});

setTimeout(() => {
  
  z
    .then(v => {
      console.log(v);
    })
    .then(v => {
      console.log(v);
    })
    .then(v => {
      console.log(v);
    })
    // .then(v => {
    //   console.log(v);
    // }, e => {
    //   console.error('zoom',4);
    // })
    .catch(e => {
      console.error('bar 1', 666);
      // throw 444;
      return Promise.cancel(444);
    })
    .then(v => {
      console.error('success 1', 77);
    })
    .catch(e => {
      console.error('catch 1111', 77, e);
    });
  
},100);


z
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  .then(v => {
    console.log(v);
  })
  // .then(v => {
  //   console.log(v);
  // }, e => {
  //   console.error('zoom',4);
  // })
  .catch(e => {
    console.error('bar', 77);
    throw e;
  })
  .then(v => {
    console.error('success', 77);
  })
  .catch(e => {
    console.error('bar 2', 77);
  })
  .then(v => {
    console.error('success', 78);
  });
