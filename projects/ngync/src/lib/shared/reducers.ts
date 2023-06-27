import { Action, ActionReducer, createFeatureSelector, createSelector } from '@ngrx/store';
import { Deferred, FormActions, FormActionsInternal } from './actions';
import { Queue } from './queue';
import { deepClone, difference, getValue, primitive, setValue } from './utils';



export interface FormCast {
  value: any;
  errors?: Record<string, string>;
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}



export const selectSlice = (slice: string) => createFeatureSelector<FormCast>(slice);
export const selectValue = (slice: string) => createSelector(selectSlice(slice), state => state?.value);
export const selectErrors = (slice: string) => createSelector(selectSlice(slice), state => state?.errors);
export const selectDirty = (slice: string) => createSelector(selectSlice(slice), state => state?.dirty);
export const selectStatus = (slice: string) => createSelector(selectSlice(slice), state => state?.status);
export const selectSubmitted = (slice: string) => createSelector(selectSlice(slice), state => state?.submitted);



export const propValue = (path: string) => `${path}.value`;
export const propErrors = (path: string) => `${path}.errors`;
export const propDirty = (path: string) => `${path}.dirty`;
export const propStatus = (path: string) => `${path}.status`;
export const propSubmitted = (path: string) => `${path}.submitted`;


export const actionQueues = new Map<string, Queue<Action>>();

export const forms = (initialState: any = {}, logging = true, queueEnabled = true) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = state;
    const path = action?.path;

    if(path) {
      const slice = path.split('::')[0];

      if(!queueEnabled || queueEnabled && action?.deferred) {

        nextState = reducer(state, action);

        switch(action.type) {
          case FormActions.InitForm:
            nextState = setValue(state, slice, { value: action.value });
            break;
          case FormActions.UpdateForm:
            nextState = setValue(state, slice, {...getValue(state, slice), value: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propValue(slice)) || {}), action.value) });
            break;
          case FormActions.UpdateSubmitted:
            nextState = setValue(state, propSubmitted(slice), action.submitted);
            break;
          case FormActions.UpdateModelProperty: {
            const paths = path.split('::');
            const property = paths.length === 2 ? `${propValue(paths[0])}.${paths[1]}` : propValue(paths[0]);
            nextState = primitive(action.value) ? setValue(state, property, action.value) : setValue(state, property, Object.assign(deepClone(getValue(state, propValue(paths[0])) || {}), action.value));
            break;
          }
          case FormActions.ResetForm:
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
            nextState = setValue(state, slice, { value: action.value });
            break;
          case FormActionsInternal.AutoSubmit:
            nextState = setValue(state, propSubmitted(slice), true);
            break;
          case FormActionsInternal.FormDestroyed:
            break;
        }

        nextState = logger(logging)(() => nextState)(state, action);
        return nextState;

      } else if(queueEnabled) {
        actionQueues.has(slice) || actionQueues.set(slice, new Queue<Action>());
        const queue = actionQueues.get(slice)!;

        if (action.type === FormActions.InitForm || action.type === FormActionsInternal.AutoInit) {
          const type = queue.peek()?.type;

          if (type === FormActionsInternal.AutoInit) { queue.first(new Deferred(action)); }
          else if(type === FormActions.InitForm) { action.type === FormActions.InitForm && queue.first(action); }
          else { queue.shift(new Deferred(action)); }

          queue.initialized$.next(true);
          return nextState;
        }
        else {

          queue.enqueue(new Deferred(action));
          return nextState;
        }

      } else {
        nextState = reducer(state, action);
        nextState = logger(logging)(() => nextState)(state, action);
        return nextState;
      }
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}

const logger = (enabled = true) => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    const result = reducer(state, action);
    if(!enabled) { return result; }
    console.groupCollapsed(action.type);
    const actionCopy = deepClone(action);
    delete actionCopy.type;
    const actionPath = actionCopy?.path ?? '';
    const sep = actionPath.indexOf('::');
    const path = actionPath.substring(0, sep === -1 ? actionPath.length : sep).trim();
    delete actionCopy.path;
    console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
    const previous = path.length > 0 ? deepClone(getValue(state, path)) : state;
    const current = path.length > 0 ? deepClone(getValue(result, path)): result;
    const diff = difference(previous, current);
    console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
    console.groupEnd();
    return result;
  };
}
