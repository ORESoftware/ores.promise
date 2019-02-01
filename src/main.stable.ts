'use strict';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

declare var queueMicrotask: any;

const CancelSymbol = Symbol('cancel');
const RejectSymbol = Symbol('reject');

type ResolveExecutorCallback = (v: any) => true;
type RejectExecutorCallback = (v: any) => false;

type OnResolved = (v: any) => any;
type OnRejected = (v: any) => any;

type PromiseExecutor = (
  resolve: ResolveExecutorCallback,
  reject: RejectExecutorCallback
) => void;

type QueueItem = { resolve: any, reject: any, onResolved: any, onRejected: any };

export class Promise {
  
  state = 'pending';
  val = <any>null;
  thens: Array<QueueItem> = [];
  onRejected: (err: any) => any = null;
  microtaskElapsed = false;
  
  constructor(f: PromiseExecutor) {
    
    try {
      f(v => {
        
        queueMicrotask(() => {
          this._handleOnResolved(v);
        });
        
        return true;
        
      }, err => {
        
        queueMicrotask(() => {
          this._handleOnRejected(err);
        });
        
        return false;
      });
    }
    catch (err) {
      queueMicrotask(() => {
        this._handleOnRejected(err);
      });
    }
  }
  
  _handleMicroTask() {
    this.microtaskElapsed = true;
  }
  
  _handleOnResolved(v: any) {
    
    if (this.state === 'resolved') {
      throw 'Promise resolve callback fired twice.';
    }
    
    if (this.state === 'rejected') {
      throw 'Promise resolve callback fired after promise was already rejected.';
    }
    
    this.val = v;
    this.state = 'resolved';
    
    if (this.thens.length < 1) {
      return;
    }
    
    this._resolveThenables();
  }
  
  _handleOnRejected(err: any) {
    
    if (this.state === 'rejected') {
      throw 'Promise reject callback fired twice.';
    }
    
    if (this.state === 'resolved') {
      throw 'Promise reject callback fired after promise was already resolved.';
    }
    
    this.val = err;
    this.state = 'rejected';
    
    if (this.thens.length < 1) {
      return;
    }
    
    this._rejectThenables();
  }
  
  _resolveThenables() {
    for (let v of this.thens) {
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
  
  _rejectThenables() {
    for (let v of this.thens) {
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
    return new Promise(resolve => resolve(val));
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
    
    return new Promise((resolve, reject) => {
      
      if (this.state === 'pending') {
        return this.thens.push({onResolved, onRejected, resolve, reject});
      }
      
      if (this.state === 'resolved') {
        
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
      
      if (onRejected) {
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
      }
      
      reject(this.val);
      
    });
  }
  
  catch(f: OnRejected) {
    return this.then(null, f);
  }
  
}

