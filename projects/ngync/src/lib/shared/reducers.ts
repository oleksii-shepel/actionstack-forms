import { ActionReducer, createFeatureSelector, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, getValue, reset, setValue, unassign } from './utils';



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



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    state = state ?? initialState;
    let nextState = reducer(state, action);
    let path = action?.path;

    if(!path) {
      return nextState;
    }

    switch(action.type) {
      case FormActions.InitForm:
        return setValue(state, path, { model: Object.assign(deepClone(getValue(state, `${path}.model`) || {}), action.value) });

      case FormActions.UpdateForm:
        return setValue(state, path, {...getValue(state, path), model: Object.assign(deepClone(getValue(state, `${path}.model`) || {}), action.value) });

      case FormActions.UpdateSubmitted:
        return setValue(state, `${path}.submitted`, action.value);

      case FormActionsInternal.ResetForm:
        return setValue(state, path, { model: action.resetState ? reset(unassign(deepClone(getValue(state, `${path}.model`) || {}), action.value), action.resetState) : Object.assign(deepClone(getValue(state, `${path}.model`) || {}), action.value) });

      case FormActionsInternal.UpdateValue:
          return setValue(state, path, Object.assign(deepClone(getValue(state, `${path}`) || {}), action.value));

      case FormActionsInternal.UpdateStatus:
        return setValue(state, `${path}.status`, action.status);

      case FormActionsInternal.UpdateErrors:
        return setValue(state, `${path}.errors`, deepClone(action.errors));

      case FormActionsInternal.UpdateDirty:
        return setValue(state, `${path}.dirty`, action.dirty);

      case FormActionsInternal.AutoInit:
        return setValue(state, path, { model: Object.assign(deepClone(getValue(state, `${path}.model`) || {}), action.value) });

      case FormActionsInternal.AutoSubmit:
        return setValue(state, `${path}.submitted`, true);

      default:
        return nextState;
    }
  }
}



export const logger = (settings: any = {}) => (reducer: ActionReducer<any>): any => {
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
