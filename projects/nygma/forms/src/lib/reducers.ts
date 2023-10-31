import { Action, ActionReducer, createSelector } from '@ngrx/store';
import { ActionArray, Deferred, FormActions, FormActionsInternal } from './actions';
import { Queue } from './queue';
import { deepClone, deepEqual, getValue, setValue } from './utils';




export type FormState = any;




export const selectFormState = (path: string, nocheck?: boolean) => createSelector((state: any) => {
  const form = deepClone(getValue(state, path));
  if(!form.__form) { !nocheck && console.warn(`You are trying to read form state from the store by path '${path}', but it is not marked as such. Is the sync directive at this point in time initialized? Consider putting your code in a ngAfterViewInit hook`); }
  else { delete form.__form; }
  return form;
}, state => state);



export const actionQueues = new Map<string, Queue<Action>>();



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {
    state = state ?? deepClone(initialState);

    let nextState = state;
    const slice = action.path;
    if(slice && ActionArray.includes(action.type)) {
      if (!actionQueues.has(slice)) {
        actionQueues.set(slice, new Queue());
      }

      if(actionQueues.get(slice)?.initialized$.value || action.type === FormActionsInternal.AutoInit || action.deferred) {
        let form = getValue(nextState, slice);

        switch(action.type) {
          case FormActions.UpdateForm:
            if(!form.__form) {
              console.warn(`Seems like sync directive is not initialized at this point in time, consider putting form update in a ngAfterViewInit hook`);
            }
            form = !action.noclone ? deepClone(action.value) : {...action.value};
            form.__form = true;
            break;
          case FormActions.UpdateField:
            if(!form.__form) {
              console.warn(`Seems like sync directive is not initialized at this point in time, consider putting form update in a ngAfterViewInit hook`);
            }
            form = setValue(form, action.property, action.value);
            form.__form = true;
            break;
          case FormActionsInternal.AutoInit:
            if(actionQueues.has(slice)) {
              const queue = actionQueues.get(slice) as Queue<Action>;
              queue.initialized$.next(true);
              queue.initialized$.complete();
            }
            form = !action.noclone ? deepClone(action.value) : {...action.value};
            form.__form = true;
            break;
          case FormActionsInternal.AutoSubmit:
            break;
          case FormActionsInternal.FormDestroyed:
            actionQueues.delete(slice);
            break;
        }

        nextState = setValue(nextState, slice, form);
        return nextState;
      } else {
          const queue = actionQueues.get(slice) as Queue<Action>;
          queue.enqueue(new Deferred(action));
          return nextState;
      }
    }

    nextState = reducer(state, action);
    return nextState;
  }
  return metaReducer;
}

export const logger = (settings: {showAll?: boolean, showRegular?: boolean, showDeferred?: boolean, showOnlyModifiers?: boolean, showMatch?: RegExp}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showRegular: false, showDeferred: false, showOnlyModifiers: true}, settings);

  function filter(action: any, equal: any): boolean {
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
    if(settings.showOnlyModifiers && !equal) {
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
    delete actionCopy?.path;

    const previous = actionPath.length > 0 ? getValue(state, actionPath) : state;
    const current = actionPath.length > 0 ? getValue(result, actionPath) : result;
    const equal = deepEqual(previous, current);

    if(filter(action, equal)) {
      console.groupCollapsed("%c%s%c", action.deferred ? "color: blue;" : "color: black;", action.type, "color: black;");
      console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
      console.log(current);
      console.groupEnd();
    }
    return result;
  };
}
