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



export const selectFormCast = (split: string) => createSelector((state: any) => {
  const paths = split?.split('::'); const feature = paths && paths[0]; const form = paths && paths[1];
  return feature && form && getValue(state[feature], form);
}, state => state);
export const selectValue = (split: string) => createSelector(selectFormCast(split), state => state?.value);
export const selectErrors = (split: string) => createSelector(selectFormCast(split), state => state?.errors);
export const selectDirty = (split: string) => createSelector(selectFormCast(split), state => state?.dirty);
export const selectStatus = (split: string) => createSelector(selectFormCast(split), state => state?.status);
export const selectSubmitted = (split: string) => createSelector(selectFormCast(split), state => state?.submitted);



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
    const paths = action.split?.split('::');
    const property = paths && paths[2];
    const feature = paths && paths[0];
    const form = paths && paths[1];
    const slice = paths && paths[1] && `${paths[0]}::${paths[1]}`;

    if(slice) {

      if(!actionQueues.has(slice) || action.deferred) {

        nextState = reducer(state, action);
        let formCast = getValue(nextState[feature], form);

        switch(action.type) {
          case FormActions.UpdateForm:
            formCast = setValue(formCast, propValue, action.value);
            break;
          case FormActions.UpdateField:
            formCast = setValue(formCast,`${propValue}.${property}`, action.value);
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

        nextState = {...nextState, [feature]: setValue(nextState[feature], form, formCast)};
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

export const logger = (settings: {showAll?: boolean, showRegular?: boolean, showDeferred?: boolean, showOnlyModifiers?: boolean, showMatch?: RegExp}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showRegular: false, showDeferred: false, showOnlyModifiers: true}, settings);

  function filter(action: any, difference: any): boolean {
    let show = false;

    if(settings.showMatch && action.type.match(settings.showMatch)) {
      show = true;
    }
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

    const split = actionCopy.split?.split('::');
    const feature = split && split[0];
    const form = split && split[1];

    delete actionCopy.split;

    const previous = split?.length > 1 ? getValue(state[feature], form) : state;
    const current = split?.length > 1 ? getValue(result[feature], form) : result;
    const diff = difference(previous, current);

    if(filter(action, diff)) {
      console.groupCollapsed("%c%s%c", action.deferred ? "color: blue;" : "color: black;", action.type, "color: black;");
      console.log("split: '%c%s%c', payload: %o", "color: red;", split?.join('::') ?? '', "color: black;", actionCopy);
      console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
      console.groupEnd();
    }
    return result;
  };
}
