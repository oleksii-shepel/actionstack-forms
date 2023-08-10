import { ActionReducer, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, difference, getValue, setValue } from './utils';



export type FormState = any;




export const selectFormState = (split: string) => createSelector((state: any) => {
  const paths = split?.split('::'); const feature = paths && paths[0]; const form = paths && paths[1];
  return feature && form && getValue(state[feature], form);
}, state => state);



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

      nextState = reducer(state, action);
      let formState = getValue(nextState[feature], form);

      switch(action.type) {
        case FormActions.UpdateForm:
          formState = action.value;
          break;
        case FormActions.UpdateField:
          formState = setValue(formState, property, action.value);
          break;
        case FormActionsInternal.AutoInit:
          formState = action.value;
          break;
        case FormActionsInternal.AutoSubmit:
          break;
        case FormActionsInternal.FormDestroyed:
          break;
      }

      nextState = {...nextState, [feature]: setValue(nextState[feature], form, formState)};
      return nextState;
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}

export const logger = (settings: {showAll?: boolean, showOnlyModifiers?: boolean, showMatch?: RegExp}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showOnlyModifiers: true}, settings);

  function filter(action: any, difference: any): boolean {
    let show = false;
    if(settings.showMatch && action.type.match(settings.showMatch)) {
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
