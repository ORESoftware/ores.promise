#!/usr/bin/env node

import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as assert from 'assert';
import * as EE from 'events';
import * as strm from "stream";


console.log('your simple typescript test goes here.');


class Longitude extends Number {
  longitude = true;
}

class Latitude extends Number {
  latitude = true;
}

function getPoint(latitude: Latitude, longitude: Longitude) {
  return {latitude, longitude};
}

// getPoint(3,3);
// getPoint(new Longitude(3), new Latitude());
getPoint(new Latitude(4),new Longitude(5));   // yay

type ExecutorCallback = (v: any) => void;

type PromiseExecutor = (
  resolve: ExecutorCallback,
  reject: ExecutorCallback
) => void;


export class Promise {
  
  constructor(f: PromiseExecutor) {
    
    f(v => {
    
    }, err => {
    
    });
    
  }
  
}

export class ResolveCallback extends Function {
  resolve = true;
  private instance = new RejectCallback();
  
  static create(cb: Function): ResolveCallback {
    return <ResolveCallback>cb;
  }
}

export class RejectCallback extends Function {
  
  reject = true;
  private instance = new RejectCallback();
  
  static create(cb: Function): RejectCallback {
    return <RejectCallback>cb;
  }
}


const runResolve = function (cb : ResolveCallback) {
 console.log(cb.resolve);
 cb();
};

const runReject = function (cb : RejectCallback) {
  console.log(cb.reject);
  cb();
};


const wrap = function<T>(x: object, v: T) :  T {
  return Object.setPrototypeOf(x, <any>v);
};

runResolve(wrap(() => {
   console.log('cats');
}, new ResolveCallback()));

runReject(wrap(() => {
  console.log('dogs');
}, new RejectCallback()));


runResolve(ResolveCallback.create(() => {
  console.log('cats');
}));

runReject(wrap(() => {
  console.log('dogs');
}, new RejectCallback()));

// function getPoint(longitude: number, latitude: number) {
//   return {longitude, latitude};
// }
