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

export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = state;
    const path = action?.path;

    if(path) {
      const slice = path.split('::')[0];

      if(!actionQueues.has(slice) || action.deferred) {

        nextState = reducer(state, action);

        switch(action.type) {
          case FormActions.UpdateForm:
            nextState = setValue(state, slice, {...getValue(state, slice), value: primitive(action.value) ? action.value : Object.assign(deepClone(getValue(state, propValue(slice)) || {}), action.value) });
            break;
          case FormActions.UpdateProperty: {
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

        return nextState;

      } else {
        const queue = actionQueues.get(slice) as Queue<Action>;
        const type = queue.peek()?.type;

        if(!queue.initialized$.value) {
         if(action.type === FormActionsInternal.AutoInit && type !== FormActionsInternal.AutoInit) {
            queue.shift(new Deferred(action));
            queue.initialized$.next(true);
            return nextState;
          } else if (type === FormActionsInternal.AutoInit) {
            queue.first(new Deferred(action));
            queue.initialized$.next(true);
            return nextState;
          } else {
            queue.enqueue(new Deferred(action));
            return nextState;
          }
        } else {
          queue.enqueue(new Deferred(action));
          return nextState;
        }
      }
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}

export const logger = (settings: {showAll?: boolean, showRegular?: boolean, showDeferred?: boolean, showOnlyModifiers?: boolean}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showRegular: false, showDeferred: false, showOnlyModifiers: true}, settings);

  function filter(action: any, difference: any): boolean {
    let show = false;
    if(settings.showRegular && !action.deferred) {
      show = true;
    }
    if(settings.showDeferred && action.deferred) {
      show = true;
    }
    if(settings.showOnlyModifiers && Object.keys(difference).length > 0) {
      show = true;
    }
    if(settings.showAll) {
      show = true;
    }
    return show;
  }

  return (state: any, action: any) => {
    const result = reducer(state, action);
    const actionCopy = deepClone(action);
    delete actionCopy.type;

    const actionPath = actionCopy?.path ?? '';
    const sep = actionPath.indexOf('::');
    const path = actionPath.substring(0, sep === -1 ? actionPath.length : sep).trim();
    delete actionCopy.path;

    const previous = path.length > 0 ? deepClone(getValue(state, path)) : state;
    const current = path.length > 0 ? deepClone(getValue(result, path)): result;
    const diff = difference(previous, current);

    if(filter(action, diff)) {
      console.groupCollapsed("%c%s%c", action.deferred ? "color: blue;" : "color: black;", action.type, "color: black;");
      console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
      console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
      console.groupEnd();
    }
    return result;
  };
}
