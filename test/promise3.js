

// const {Promise} = require('../dist/main');

const p = new Promise((resolve,reject) => {
  // throw 'barf';
  setTimeout(() => {
    reject('barf');
  },5);
});

// .then(v => {
//   console.log({resolved:v});
// }, e => {
//   console.error({rejected:e});
// });


const p1 = p.then(v => Promise.resolve(3), z => {
  console.error('error 1:', z);
  return 32; // Promise.resolve(32);
});

const p2 = p.then(v => Promise.resolve(4), z => {
  console.error('error 2:', z);
  return 42; //Promise.resolve(42);
});

p1.then(console.log.bind(null, '3?'));
p2.then(console.log.bind(null, '4?'));
