import { Action, ActionReducer, createFeatureSelector, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { Queue } from './queue';
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


export const actionQueues = new Map<string, Queue<Action>>();

export const forms = (initialState: any = {}, logging = true) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = reducer(state, action);
    let path = action?.path;

    if(path) {
      let slice = path.split('::')[0];
      actionQueues.has(slice) || actionQueues.set(slice, new Queue<Action>());
      let queue = actionQueues.get(slice)!;

      if(queue.initialized$.value) {
        switch(action.type) {
          case FormActions.InitForm:
            nextState = setValue(state, slice, { model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(slice)) || {}), action.value) });
            break;
          case FormActions.UpdateForm:
            nextState = setValue(state, slice, {...getValue(state, slice), model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(slice)) || {}), action.value) });
            break;
          case FormActions.UpdateSubmitted:
            nextState = setValue(state, propSubmitted(slice), action.value);
            break;
          case FormActions.UpdateModel:
            let paths = slice.split('::');
            let property = paths.length === 2 ? `${propModel(paths[0])}.${paths[1]}` : propModel(paths[0]);
            nextState = primitive(action.value) ? setValue(state, property, action.value) : setValue(state, property, Object.assign(deepClone(getValue(state, propModel(paths[0])) || {}), action.value));
            break;
          case FormActions.ResetForm:
            nextState = nextState;
            break;
          case FormActionsInternal.UpdateStatus:
            nextState = setValue(state, propStatus(slice), action.status);
            break;
          case FormActionsInternal.UpdateErrors:
            nextState = setValue(state, propErrors(slice), deepClone(action.errors));
            break;
          case FormActionsInternal.UpdateDirty:
            nextState = setValue(state, propDirty(slice), action.dirty);
            break;
          case FormActionsInternal.AutoInit:
            nextState = setValue(state, slice, { model: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propModel(slice)) || {}), action.value) });
            break;
          case FormActionsInternal.AutoSubmit:
            nextState = setValue(state, propSubmitted(slice), true);
            break;
          case FormActionsInternal.FormDestroyed:
            while(queue.length > 0) {
              let nextAction = queue.dequeue();
              nextState = metaReducer(nextState, nextAction);
            }
            actionQueues.delete(slice);
            break;
        }

        nextState = logger(logging)(() => nextState)(state, action);
        return nextState;

      } else if (action.type === FormActions.InitForm || action.type === FormActionsInternal.AutoInit) {
        queue.initialized$.next(true);
        nextState = metaReducer(nextState, action);

        while(queue.length > 0) {
          let nextAction = queue.dequeue();
          nextState = metaReducer(nextState, nextAction);
        }

        return nextState;
      }
      else {
        queue.enqueue(action);
      }
    }
    return nextState;
  }

  return metaReducer;
}

const logger = (logging = true) => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    const result = reducer(state, action);
    if(!logging || action?.postponed) { return result; }
    console.groupCollapsed(action.type);
    let actionCopy = deepClone(action);
    delete actionCopy.type;
    let actionPath = actionCopy?.path ?? '';
    let sep = actionPath.indexOf('::');
    let path = actionPath.substring(0, sep === -1 ? actionPath.length : sep).trim();
    delete actionCopy.path;
    console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
    let diff = path.length > 0 ? difference(getValue(state, path), getValue(result, path)): difference(state, result);
    console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
    console.groupEnd();
    return result;
  };
}
