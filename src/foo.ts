
/*

interface HasOnlyOneMethod {
   run(cb: HasOnlyOneMethod): any;
}

const usesACallbackFunction  = (cb: HasOnlyOneMethod) => {
  cb(); // firing cb() is the same as cb.run()
};

usesACallbackFunction(new class implements HasOnlyOneMethod {
  run(cb: HasOnlyOneMethod): any {
  
  }
});

usesACallbackFunction(cb => {
  // you can fire cb();
  // or you can fire cb.run();
  // those two calls are the same
});

*/
