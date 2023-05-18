import { Action } from '@ngrx/store';
import { FormState } from 'ngync';
import { Model, initialModel } from '../models/profile';

export interface ModelState extends FormState<Model> {}

export const initialState: ModelState = {
  model: initialModel,
};

export function profileReducer(state = initialState, action: Action): ModelState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}

/**
 * Because the data structure is defined within the reducer it is optimal to
 * locate our selector functions at this level. If store is to be thought of
 * as a database, and reducers the tables, selectors can be considered the
 * queries into said database. Remember to keep your selectors small and
 * focused so they can be combined and composed to fit each particular
 * use-case.
 */

export const getModelState = (state: ModelState) => state;
