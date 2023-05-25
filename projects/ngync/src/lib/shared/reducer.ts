import { createSelector } from '@ngrx/store';
import { FormActions } from './actions';
import { deepClone } from './builder';



export interface FormState<T> {
  model: T;
  errors?: { [k: string]: string };
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}



export function property<T extends object>(expression: (x: { [Property in keyof T]: T[Property] }) => any) {
  let prop = eval(expression.toString().replace('x.', 'o.'));
  let str: string = prop.toString().split('=>',).at(1).trim();
  return str.substring(str.indexOf('.') + 1, str.length);
}



export const iterable = (obj: any) => {
  return { [Symbol.iterator]: function* () {
    for(let element in obj) { yield element; }
  }}
}



const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
const isObject = (split: string[]) => split.length > 1 || isArray(split);



export const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);



export const setValue = (obj: any, prop: string, val: any) => {
  obj = {...obj};
  const split = prop.split('.');
  if(split.length === 0) { obj = val }
  else {
    let item = obj;
    while(split.length >= 1) {
      const key = split.at(0)!;
      item[key] = isArray(split) ? item[key] || [] : isObject(split) ? {...item[key]} || {} : val;
      item = item[key];
      split.shift()
    }
  }
  return obj;
};



export function findProps(obj: any): string[] {
  var result: string[] = [];
  const findKeys = (obj: any, prefix: string = '') => {
    for (let prop in obj) {
      result.push(`${prefix}${prop}`)
      let sub = obj[prop]
      if (typeof(sub) == "object") {
        findKeys(sub, `${prop}.`);
      }
    }
  }
  findKeys(obj);
  return result;
}



export const getSlice = (slice: string) => (state: any) => (getValue(state, slice) as FormState<any>);
export const getModel = (slice: string) => createSelector(getSlice(slice), state => state.model);
export const getErrors = (slice: string) => createSelector(getSlice(slice), state => state.errors);
export const getDirty = (slice: string) => createSelector(getSlice(slice), state => state.dirty);
export const getStatus = (slice: string) => createSelector(getSlice(slice), state => state.status);
export const getSubmitted = (slice: string) => createSelector(getSlice(slice), state => state.submitted);



export function forms(reducer: Function) {
  return function(state: any, action: any) {
    let nextState = reducer(state, action);
    let path = action?.payload?.path;

    if (action.type === FormActions.Init) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.model)}`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.UpdateValue || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.model)}`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.UpdateStatus || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.status)}`, action.payload.status);
    }

    if (action.type === FormActions.UpdateErrors || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.errors)}`, deepClone(action.payload.errors));
    }

    if (action.type === FormActions.UpdateDirty || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.dirty)}`, action.payload.dirty);
    }

    if (action.type === FormActions.SetDirty) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.dirty)}`, true);
    }

    if (action.type === FormActions.SetPrestine) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.dirty)}`, false);
    }

    if (action.type === FormActions.Reset) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path)}`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.Submitted) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.submitted)}`, true);
    }

    if (action.type === FormActions.UpdateSubmitted) {
      nextState = setValue(nextState, `${path}.${property<FormState<any>>(path => path.submitted)}`, action.payload.value);
    }

    return nextState;
  }
}



export function logger(reducer: Function) {
  return (state: any, action: any): any => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('state before', state);
    console.log('action', action);
    console.log('state after', result);
    console.groupEnd();
    return result;
  };
}
