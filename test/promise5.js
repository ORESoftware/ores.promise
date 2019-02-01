const {Promise} = require('../dist/main');

const z = Promise.resolve(null).then(v => {
  throw new Error('fart');
  //  return 'meow';
});

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
    console.error('bar', 66, e.message);
  })
  .then(v => {
    console.log('sam');
  });

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
    // throw e;
    return Promise.reject(e);
  })
  .then(v => {
    console.error('success', 77);
    return Promise.reject('stoop');
  })
  .catch(e => {
    console.error('bar 2', 77, e);
  });
