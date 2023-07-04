import { ActionReducer, createSelector } from '@ngrx/store';
import { FormActions } from './actions';
import { deepClone, getValue, setValue } from './utils';



export const selectForm = (slice: string) => createSelector((state: any) => getValue(state, slice), state => state);



export const forms = (initialState: any = {}) => (reducer: ActionReducer<any>): any => {

  const metaReducer = (state: any, action: any) => {

    state = state ?? deepClone(initialState);
    let nextState = state;
    const slice = action?.path;

    if(slice) {
      nextState = reducer(state, action);

      if(action.type === FormActions.UpdateForm) {
        nextState = setValue(nextState, slice, action.value);
        return nextState;
      }
    }

    nextState = reducer(state, action);
    return nextState;
  }

  return metaReducer;
}
