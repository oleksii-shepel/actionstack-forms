import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormActions } from './actions';
import { deepClone } from './builder';



export interface FormState<T> {
  model: T;
  errors?: { [k: string]: string };
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}



export function prop<T extends object>(expression: (x: { [prop in keyof T]: T[prop] }) => any) {
  let str = expression.toString().split('=>',).at(1)!.trim();
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
  const split = prop.split('.');
  if(split.length === 0) { obj = val; return obj; }
  else {
    let root = {...obj};
    let item = root;
    while(split.length >= 1) {
      const key = split.at(0)!;
      item[key] = isArray(split) ? [...iterable(item[key])] || [] : isObject(split) ? {...item[key]} || {} : val;

      item = item[key];
      split.shift()
    }

    return root;
  }
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



export const getSlice = (slice: string) => createFeatureSelector<FormState<any>>(slice);
export const getModel = (slice: string) => createSelector(getSlice(slice), state => state.model);
export const getErrors = (slice: string) => createSelector(getSlice(slice), state => state.errors);
export const getDirty = (slice: string) => createSelector(getSlice(slice), state => state.dirty);
export const getStatus = (slice: string) => createSelector(getSlice(slice), state => state.status);
export const getSubmitted = (slice: string) => createSelector(getSlice(slice), state => state.submitted);



export const forms = (initialState: any) => (reducer: Function) => {
  return (state: any, action: any) => {
    state = state ?? initialState;
    let nextState = reducer(state, action);
    let path = action?.path;

    if(!path) {
      return nextState;
    }

    if (action.type === FormActions.InitForm) {
      nextState = setValue(state, path, { model: deepClone(action.value) });
    }

    if (action.type === FormActions.ResetForm) {
      nextState = setValue(state, path, { model: deepClone(action.value) });
    }

    if (action.type === FormActions.UpdateValue) {
      nextState = setValue(state, `${path}.model`, deepClone(action.value));
    }

    if (action.type === FormActions.UpdateStatus) {
      nextState = setValue(state, `${path}.status`, action.status);
    }

    if (action.type === FormActions.UpdateErrors) {
      nextState = setValue(state, `${path}.errors`, deepClone(action.errors));
    }

    if (action.type === FormActions.UpdateDirty) {
      nextState = setValue(state, `${path}.dirty`, action.dirty);
    }

    if (action.type === FormActions.UpdateSubmitted) {
      nextState = setValue(state, `${path}.submitted`, action.value);
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
