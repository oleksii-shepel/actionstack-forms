import { Action } from '@ngrx/store';
import { FormState } from '@ngrx/forms';
import { Profile, initialProfile } from '../models/profile';

export interface HeroState extends FormState<Profile> {}

export const initialState: HeroState = {
  model: initialProfile,
};

export function profileReducer(state = initialState, action: Action): HeroState {
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

export const getHeroState = (state: HeroState) => state;

