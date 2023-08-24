import { ActionReducer, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, difference, getValue, setValue } from './utils';



export type FormState = any;




export const selectFormState = (path: string) => createSelector((state: any) => getValue(state, path), state => state);



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    //console.log(JSON.stringify(state));
    let nextState = state;
    const slice = action.path;

    if(slice) {

      nextState = reducer(state, action);
      let form = getValue(nextState, slice);

      switch(action.type) {
        case FormActions.UpdateForm:
          form = deepClone(action.value);
          break;
        case FormActions.UpdateField:
          form = setValue(form, action.property, action.value);
          break;
        case FormActionsInternal.AutoInit:
          form = deepClone(action.value);
          break;
        case FormActionsInternal.AutoSubmit:
          break;
        case FormActionsInternal.FormDestroyed:
          break;
      }

      nextState = setValue(nextState, slice, form);
      return nextState;
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}

export const logger = (settings: {showAll?: boolean, showOnlyModifiers?: boolean, showMatch?: RegExp}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showOnlyModifiers: true}, settings);

  function filter(action: any, diff: any): boolean {
    let show = false;
    if(settings.showMatch && action.type.match(settings.showMatch)) {
      show = true;
    }
    if(settings.showOnlyModifiers && Object.keys(diff).length > 0) {
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
    const diff = difference(previous, current);
    if(filter(action, diff)) {
      console.groupCollapsed("%c%s%c", "color: black;", action.type, "color: black;");
      console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
      console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
      console.groupEnd();
    }
    return result;
  };
}
