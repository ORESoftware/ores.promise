

const {Promise} = require('../dist/main');


const container = {
  value: 0
};

const upMicroTask = () => {
  queueMicrotask(() => {
    container.value++;
    upMicroTask();
  })
};

// upMicroTask();

const p = new Promise((resolve,reject) => {
 
  console.log('aaa',container);
  throw 'barf';
  setTimeout(() => {
    reject('barf');
  },5);
});

// .then(v => {
//   console.log({resolved:v});
// }, e => {
//   console.error({rejected:e});
//   console.error({rejected:e});
// });


const p1 = p.then(v => Promise.resolve(3), z => {
  console.error('error 1:', z);
  console.log('bbb',container);
  return 32; // Promise.resolve(32);
});

const p2 = p.then(v => Promise.resolve(4), z => {
  console.error('error 2:', z);
  console.log('ccc',container);
  return 42; //Promise.resolve(42);
});

p1.then(v => {
  console.log('ddd',container);
  console.log('3?',v);
});

p2.then(v => {
  console.log('eee',container);
  console.log('4?',v);
});
