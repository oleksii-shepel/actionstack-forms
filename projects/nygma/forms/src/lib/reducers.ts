import { ActionReducer, createSelector } from '@ngrx/store';
import { FormActions, FormActionsInternal } from './actions';
import { deepClone, difference, getValue, primitive, setValue } from './utils';



export type FormState = any;




export const selectFormState = (path: string) => createSelector((state: any) => {
  const paths = path?.split('.'); const feature = paths && paths[0]; const form = paths && paths?.slice(1).join('.');
  return feature && form && getValue(state[feature], form);
}, state => state);



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = state;
    const paths = action.path?.split('.');
    const slice = paths && paths[0];
    const property = paths && paths.slice(1).join('.');

    if(slice) {

      nextState = reducer(state, action);
      let feature = nextState[slice];

      switch(action.type) {
        case FormActions.UpdateForm:
          feature = setValue(feature, property, action.value);
          break;
        case FormActions.UpdateField:
          feature = setValue(feature, property, action.value);
          break;
        case FormActionsInternal.AutoInit:
          feature = setValue(feature, property, action.value);
          break;
        case FormActionsInternal.AutoSubmit:
          break;
        case FormActionsInternal.FormDestroyed:
          break;
      }

      nextState = {...nextState, [slice]: feature};
      return nextState;
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}

export const logger = (settings: {showAll?: boolean, showOnlyModifiers?: boolean, showMatch?: RegExp}) => (reducer: ActionReducer<any>): any => {
  settings = Object.assign({showAll: false, showOnlyModifiers: true}, settings);

  function filter(action: any, different: boolean): boolean {
    let show = false;
    if(settings.showMatch && action.type.match(settings.showMatch)) {
      show = true;
    }
    if(settings.showOnlyModifiers && different) {
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
    const different = (primitive(previous) && primitive(current) && current !== previous) || Object.keys(diff).length > 0;
    if(filter(action, different)) {
      console.groupCollapsed("%c%s%c", "color: black;", action.type, "color: black;");
      console.log("path: '%c%s%c', payload: %o", "color: red;", actionPath, "color: black;", actionCopy);
      if(primitive(previous) && primitive(current)) {
        console.log('changed: %o', current);
      } else {
        console.log('added: %o, removed: %o, changed: %o', diff.added || {}, diff.removed || {}, diff.changed || {});
      }
      console.groupEnd();
    }
    return result;
  };
}
