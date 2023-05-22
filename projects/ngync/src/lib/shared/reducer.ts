import { ActionReducer, State } from '@ngrx/store';
import { FormActions } from './actions';
import { deepClone } from './builder';

export interface FormState<T> {
  model: T;
  errors?: { [k: string]: string };
  dirty?: boolean;
  status?: string;
}

export const getValue = (obj: any, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

export const setValue = (obj: any, prop: string, val: any) => {
  obj = { ...obj };
  const split = prop.split('.');
  const last = split[split.length - 1];
  split.reduce((acc, part, index, array) => {
    if (index === array.length - 1) {
      acc[part] = val;
    } else {
      acc[part] = { ...acc[part] };
    }
    return acc && acc[part];
  }, obj);
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
      nextState = setValue(nextState, `${action.payload}.dirty`, true);
    }

    if (action.type === FormActions.SetPrestine) {
      nextState = setValue(nextState, `${action.payload}.dirty`, false);
    }

    if (action.type === FormActions.SetDisabled) {
      nextState = setValue(nextState, `${action.payload}.disabled`, true);
    }

    if (action.type === FormActions.SetEnabled) {
      nextState = setValue(nextState, `${action.payload}.disabled`, false);
    }

    if (action.type === FormActions.Reset) {
      nextState = setValue(nextState, `${action.payload.path}`, deepClone(action.payload.value));
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
