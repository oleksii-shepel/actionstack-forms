import { Action } from '@ngrx/store';
import { FormState } from '@ngrx/reactive-forms';
import { Profile } from '../models/profile';

export interface ProfileState extends FormState<Profile> {}

export const initialState: ProfileState = {
  model: {
    firstName: '',
    lastName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    aliases: []
  }
};

export function profileReducer(state = initialState, action: Action): ProfileState {
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

export const getProfileState = (state: ProfileState) => state;
