'use strict';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

declare var queueMicrotask: any;

const CancelSymbol = Symbol('cancel');
const RejectSymbol = Symbol('reject');

// type ResolveExecutorCallback = (v: any, noDelay?: boolean) => true;
// type RejectExecutorCallback = (v: any, noDelay?: boolean) => false;

type ResolveExecutorCallback = (v?: any) => true;
type RejectExecutorCallback = (v: any) => false;

type OnResolved = (v: any) => any;
type OnRejected = (v: any) => any;

type PromiseExecutor = (
  resolve: ResolveExecutorCallback,
  reject: RejectExecutorCallback,
  p: Promise
) => void;

type Thenable = {p: Promise, resolve: any, reject: any, onResolved: any, onRejected: any };

export class Promise {
  
  state = 'pending';
  preState = 'pending';
  val = <any>null;
  thens: Array<Thenable> = [];
  onRejected: (err: any) => any = null;
  microtaskElapsed = false;
  
  constructor(f: PromiseExecutor) {
    
  
    try {
      f(v => {
          
          // console.log(1,{v,noDelay});
          
          // if (noDelay && this.microtaskElapsed) {
          //   console.log('no delay');
          //   this._handleOnResolved(v);
          // }
          // else {
          //   queueMicrotask(() => {
          //     this._handleOnResolved(v);
          //   });
          // }
    
          this._handleOnResolved(v);
          return true;
        },
        
        err => {
          
          // console.log(2,{err,noDelay});
  
          this._handleOnRejected(err);
          
          // if (noDelay && this.microtaskElapsed) {
          //   console.log('no delay');
          //   this._handleOnRejected(err);
          // }
          // else {
          //   queueMicrotask(() => {
          //     this._handleOnRejected(err);
          //   });
          // }
          
          return false;
        },
        this
      );
    }
    catch (err) {
      // if () {
      //   this._handleOnRejected(err);
      // }
      // else {
      queueMicrotask(() => {
        this._handleOnRejected(err);
      });
      // }
      
    }
  
    queueMicrotask(this._handleMicroTask.bind(this));
    
  }
  
  _handleMicroTask() {
    
    this.microtaskElapsed = true;
    
    // if (this.state === 'resolved') {
    //   this._resolveThenables();
    // }
    // else if (this.state === 'rejected') {
    //   this._rejectThenables();
    // }
  }
  
  _handleOnResolved(v: any): true {
    
    if (this.state === 'resolved') {
      throw 'Promise resolve callback fired twice.';
    }
    
    if (this.state === 'rejected') {
      throw 'Promise resolve callback fired after promise was already rejected.';
    }
    
    this.val = v;
    this.state = 'resolved';
    
    // if (!this.microtaskElapsed) {
    //   return;
    // }
    
    if (this.thens.length < 1) {
      return;
    }
  
    const doNotNeedDelay : Array<Thenable> = [];
  
    const needDelay = this.thens.filter(v => {
      // return true;
      if(v.p.microtaskElapsed === false){
        return true;
      }
      doNotNeedDelay.push(v);
    });
  
    if(doNotNeedDelay.length > 0){
      // throw 'delay bad';
    }
    
    this._resolveThenables(doNotNeedDelay);
  
    queueMicrotask(() => {
      this._resolveThenables(needDelay);
    });
    
    
    // if (this.microtaskElapsed) {
    //   this._resolveThenables();
    // }
    // else {
    //   queueMicrotask(() => {
    //     this._resolveThenables();
    //   });
    // }
    
    return true;
  }
  
  _handleOnRejected(err: any): false {
    
    if (this.state === 'rejected') {
      throw 'Promise reject callback fired twice.';
    }
    
    if (this.state === 'resolved') {
      throw 'Promise reject callback fired after promise was already resolved.';
    }
    
    this.val = err;
    // this.preState = 'rejected';
    
    this.state = 'rejected';
    
    // if (!this.microtaskElapsed) {
    //   return;
    // }
    
    if (this.thens.length < 1) {
      return;
    }
    
    const doNotNeedDelay : Array<Thenable> = [];
    
    const needDelay = this.thens.filter(v => {
      // return true;
       if(v.p.microtaskElapsed === false){
         return true;
       }
       doNotNeedDelay.push(v);
    });
  
    if(doNotNeedDelay.length > 0){
      // throw 'delay bad';
    }
    this._rejectThenables(doNotNeedDelay);
    
    queueMicrotask(() => {
      this._rejectThenables(needDelay);
    });
    
    // if (this.microtaskElapsed) {
    //   this._rejectThenables();
    // }
    // else {
    //   queueMicrotask(() => {
    //     this._rejectThenables();
    //   });
    // }
    
    return false;
  }
  
  _resolveThenables(thens: Array<Thenable>) {
    for (let v of thens) {
      
      if (!v.onResolved) {
        v.resolve(this.val);
        continue;
      }
      
      try {
        
        const val = v.onResolved(this.val);
        
        if (!Promise.isPromise(val)) {
          this._handleValue(val, v.resolve, v.reject);
          continue;
        }
        
        val.then(
          this._handleResolveOrReject(v.resolve, v.reject)
        );
        
      }
      catch (err) {
        v.reject(err);
      }
    }
  }
  
  _rejectThenables(thens: Array<Thenable>) {
    for (let v of thens) {
      
      if (!v.onRejected) {
        v.reject(this.val);
        continue;
      }
      
      try {
        
        const val = v.onRejected(this.val);
        
        if (!Promise.isPromise(val)) {
          this._handleValue(val, v.resolve, v.reject);
          continue;
        }
        
        val.then(
          this._handleResolveOrReject(v.resolve, v.reject)
        );
        
      }
      catch (err) {
        v.reject(err);
      }
    }
  }
  
  static isPromise(v: any) {
    return v
      && typeof v.then === 'function'
      && typeof v.catch === 'function';
  }
  
  static resolve(val: any) {
    
    if(!Promise.isPromise(val)){
      return new Promise(resolve => resolve(val));
    }
  
    return new Promise((resolve,reject,p) => {
      val.then(p._handleResolveOrReject(resolve,reject))
    });
  }
  
  static reject(val: any) {
    return {symbol: RejectSymbol, value: val};
  }
  
  static cancel(val: any) {
    return {symbol: CancelSymbol, value: val};
  }
  
  _handleValue(v: any, resolve: ResolveExecutorCallback, reject: RejectExecutorCallback) {
    
    if (v && v.symbol === CancelSymbol) {
      // no further processing?
      return;
    }
    
    if (v && v.symbol === RejectSymbol) {
      return reject(v.value);
    }
    
    return resolve(v);
  }
  
  _handleResolveOrReject(resolve: ResolveExecutorCallback, reject: RejectExecutorCallback) {
    return (v: any) => this._handleValue(v, resolve, reject);
  }
  
  then(onResolved: OnResolved, onRejected?: OnRejected) {
    
    return new Promise((resolve, reject, p) => {
      
      // if(!this.microtaskElapsed){
      //   return this.thens.push({onResolved, onRejected, resolve, reject});
      // }
      
      if (this.state === 'pending') {
        return this.thens.push({p, onResolved, onRejected, resolve, reject});
      }
      
      if (this.state === 'resolved') {
        
        if (!onResolved) {
          return resolve(this.val);
        }
        
        try {
          const result = onResolved(this.val);
          if (!Promise.isPromise(result)) {
            return this._handleValue(result, resolve, reject);
          }
          
          return result.then(
            this._handleResolveOrReject(resolve, reject)
          );
          
        }
        catch (err) {
          return reject(err);
        }
      }
      
      if (this.state !== 'rejected') {
        throw 'bad state - should be rejected.';
      }
      
      if (!onRejected) {
        return reject(this.val);
      }
      
      try {
        
        const result = onRejected(this.val);
        
        if (!Promise.isPromise(result)) {
          return this._handleValue(result, resolve, reject);
        }
        
        return result.then(
          this._handleResolveOrReject(resolve, reject)
        );
        
      }
      catch (err) {
        return reject(err);
      }
      
    });
  }
  
  catch(f: OnRejected) {
    return this.then(null, f);
  }
  
}

