import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, prop, setValue } from './utils';



export interface FormState {
  model: any;
  errors?: { [k: string]: string };
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}



export const getSlice = (slice: string) => createFeatureSelector<FormState>(slice);
export const getModel = (slice: string) => createSelector(getSlice(slice), state => state?.model);
export const getErrors = (slice: string) => createSelector(getSlice(slice), state => state?.errors);
export const getDirty = (slice: string) => createSelector(getSlice(slice), state => state?.dirty);
export const getStatus = (slice: string) => createSelector(getSlice(slice), state => state?.status);
export const getSubmitted = (slice: string) => createSelector(getSlice(slice), state => state?.submitted);



export const forms = (initialState: any = {}) => (reducer: Function) => {
  return (state: any, action: any) => {
    state = state ?? initialState;
    let nextState = reducer(state, action);
    let path = action?.path;

    if(!path) {
      return nextState;
    }

    switch(action.type) {
      case FormActions.InitForm:
        return setValue(state, path, { model: deepClone(action.value) } as FormState);

      case FormActions.UpdateValue:
        return setValue(state, `${path}.${prop<FormState>(x => x.model)}`, deepClone(action.value));

      case FormActions.UpdateSubmitted:
        return setValue(state, `${path}.${prop<FormState>(x => x.submitted)}`, action.value);

      case FormActionsInternal.ResetForm:
        return setValue(state, path, { model: deepClone(action.value) } as FormState);

      case FormActionsInternal.UpdateStatus:
        return setValue(state, `${path}.${prop<FormState>(x => x.status)}`, action.status);

      case FormActionsInternal.UpdateErrors:
        return setValue(state, `${path}.${prop<FormState>(x => x.errors)}`, deepClone(action.errors));

      case FormActionsInternal.UpdateDirty:
        return setValue(state, `${path}.${prop<FormState>(x => x.dirty)}`, action.dirty);

      case FormActionsInternal.AutoInit:
        return setValue(state, path, { model: deepClone(action.value) } as FormState);

      case FormActionsInternal.AutoSubmit:
        return setValue(state, `${path}.${prop<FormState>(x => x.submitted)}`, true);

      default:
        return nextState;
    }
  }
}



export const logger = (settings: any = {}) => (reducer: Function) => {
  return (state: any, action: any) => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('state before', state);
    console.log('action', action);
    console.log('state after', result);
    console.groupEnd();
    return result;
  };
}
