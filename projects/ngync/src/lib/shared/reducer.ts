import { FormActions } from './actions';
import { deepClone } from './builder';

export interface FormState<T> {
  model: T;
  errors?: { [k: string]: string };
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}

const iterable = (obj: any) => {
  return { [Symbol.iterator]: function* () {
    for(let element in obj) { yield element; }
  }}
}

export const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

const isArray = (split: string[]) => split.length >= 2 && !isNaN(+split[1]);
const isObject = (split: string[]) => split.length > 1 || isArray(split);

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

export function form(reducer: Function) {
  return function(state: any, action: any) {
    let nextState = reducer(state, action);

    if (action.type === FormActions.Init) {
      nextState = setValue(nextState, `${action.payload.path}.model`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.UpdateValue || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${action.payload.path}.model`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.UpdateStatus || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${action.payload.path}.status`, action.payload.status);
    }

    if (action.type === FormActions.UpdateErrors || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${action.payload.path}.errors`, deepClone(action.payload.errors));
    }

    if (action.type === FormActions.UpdateDirty || action.type === FormActions.UpdateForm) {
      nextState = setValue(nextState, `${action.payload.path}.dirty`, action.payload.dirty);
    }

    if (action.type === FormActions.SetDirty) {
      nextState = setValue(nextState, `${action.payload.path}.dirty`, true);
    }

    if (action.type === FormActions.SetPrestine) {
      nextState = setValue(nextState, `${action.payload.path}.dirty`, false);
    }

    if (action.type === FormActions.SetDisabled) {
      nextState = setValue(nextState, `${action.payload.path}.disabled`, true);
    }

    if (action.type === FormActions.SetEnabled) {
      nextState = setValue(nextState, `${action.payload.path}.disabled`, false);
    }

    if (action.type === FormActions.Reset) {
      nextState = setValue(nextState, `${action.payload.path}`, deepClone(action.payload.value));
    }

    if (action.type === FormActions.Submitted) {
      nextState = setValue(nextState, `${action.payload.path}.submitted`, true);
    }

    if (action.type === FormActions.UpdateSubmitted) {
      nextState = setValue(nextState, `${action.payload.path}.submitted`, action.payload.value);
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
