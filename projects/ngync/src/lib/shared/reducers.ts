import { ActionReducer, createFeatureSelector, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, difference, getValue, primitive, setValue } from './utils';



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



export const propModel = (path: string) => `${path}.model`;
export const propErrors = (path: string) => `${path}.errors`;
export const propDirty = (path: string) => `${path}.dirty`;
export const propStatus = (path: string) => `${path}.status`;
export const propSubmitted = (path: string) => `${path}.submitted`;



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    state = state ?? initialState;
    let nextState = reducer(state, action);
    let path = action?.path;

    if(path) {
      switch(action.type) {
        case FormActions.InitForm:
          return setValue(state, path, { model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(path)) || {}), action.value) });

        case FormActions.UpdateForm:
          return setValue(state, path, {...getValue(state, path), model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(path)) || {}), action.value) });

        case FormActions.UpdateSubmitted:
          return setValue(state, propSubmitted(path), action.value);

        case FormActions.UpdateModel:
          let paths = path.split('::');
          let property = paths.length === 2 ? `${propModel(paths[0])}.${paths[1]}` : propModel(paths[0]);
          return primitive(action.value) ? setValue(state, property, action.value) : setValue(state, property, Object.assign(deepClone(getValue(state, propModel(paths[0])) || {}), action.value));

        case FormActions.ResetForm:
          return nextState;

        case FormActionsInternal.UpdateStatus:
          return setValue(state, propStatus(path), action.status);

        case FormActionsInternal.UpdateErrors:
          return setValue(state, propErrors(path), deepClone(action.errors));

        case FormActionsInternal.UpdateDirty:
          return setValue(state, propDirty(path), action.dirty);

        case FormActionsInternal.AutoInit:
          return setValue(state, path, { model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(path)) || {}), action.value) });

        case FormActionsInternal.AutoSubmit:
          return setValue(state, propSubmitted(path), true);

        default:
          return nextState;
      }
    }

    return nextState;
  }
}



export const logger = (_: any = {}) => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    let actionCopy = deepClone(action);
    delete actionCopy.type;
    let path = (actionCopy?.path ?? '') as string;
    let sep = path.indexOf('::');
    path = path.substring(0, sep === -1 ? path.length : sep).trim();
    delete actionCopy.path;
    console.log("path: '%c%s%c', payload: %o", "color: red;", path, "color: black;", actionCopy);
    let diff = path.length > 0 ? difference(getValue(state, path), getValue(result, path)): difference(state, result);
    console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
    console.groupEnd();
    return result;
  };
}
