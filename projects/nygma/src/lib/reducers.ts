import { Action, ActionReducer, createSelector } from '@ngrx/store';
import { Deferred, FormActions, FormActionsInternal } from './actions';
import { Queue } from './queue';
import { deepClone, difference, getValue, setValue } from './utils';



export interface FormCast<T> {
  value: T;
  errors?: Record<string, string>;
  dirty?: boolean;
  status?: string;
  submitted?: boolean;
}



export const selectFormCast = (slice: string) => createSelector((state: any) => getValue(state, slice), state => state);
export const selectValue = (slice: string) => createSelector(selectFormCast(slice), state => state?.value);
export const selectErrors = (slice: string) => createSelector(selectFormCast(slice), state => state?.errors);
export const selectDirty = (slice: string) => createSelector(selectFormCast(slice), state => state?.dirty);
export const selectStatus = (slice: string) => createSelector(selectFormCast(slice), state => state?.status);
export const selectSubmitted = (slice: string) => createSelector(selectFormCast(slice), state => state?.submitted);



export const propValue = 'value';
export const propErrors = 'errors';
export const propDirty = 'dirty';
export const propStatus = 'status';
export const propSubmitted = 'submitted';



export const actionQueues = new Map<string, Queue<Action>>();



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = state;
    const split = action?.split?.split('::');
    const slice = split?.[0];

    if(split.length > 1) {
      let formCast = getValue(nextState[slice], split[1]);

      if(!actionQueues.has(slice) || action.deferred) {

        nextState = reducer(state, action);

        switch(action.type) {
          case FormActions.UpdateForm:
            formCast = setValue(formCast, propValue, action.value);
            break;
          case FormActions.UpdateField:
            if(split.length > 2) {
              formCast = setValue(formCast,`${propValue}.${split[2]}`, action.value);
            }
            break;
          case FormActions.ResetForm:
            break;
          case FormActionsInternal.UpdateStatus:
            formCast = setValue(formCast, propStatus, action.status);
            break;
          case FormActionsInternal.UpdateErrors:
            formCast = setValue(formCast, propErrors, deepClone(action.errors));
            break;
          case FormActionsInternal.UpdateDirty:
            formCast = setValue(formCast, propDirty, action.dirty);
            break;
          case FormActionsInternal.AutoInit:
            formCast = setValue(formCast, propValue, action.value);
            break;
          case FormActionsInternal.AutoSubmit:
            formCast = setValue(formCast, propSubmitted, true);
            break;
          case FormActionsInternal.FormDestroyed:
            break;
        }

        nextState[slice] = setValue(nextState[slice], split[1], formCast)
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

    const split = actionCopy?.split?.split('::');
    delete actionCopy?.split;

    const previous = split && split.length > 1 ? getValue(state[split[0]], split[1]) : state;
    const current = split && split.length > 1 ? getValue(result[split[0]], split[1]) : result;
    const diff = difference(previous, current);

    if(filter(action, diff)) {
      console.groupCollapsed("%c%s%c", action.deferred ? "color: blue;" : "color: black;", action.type, "color: black;");
      console.log("path: '%c%s%c', payload: %o", "color: red;", split?.join('::'), "color: black;", actionCopy);
      console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
      console.groupEnd();
    }
    return result;
  };
}
