import { ActionReducer, createAction, createSelector, props } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { HeroPage, ModelPage, ProfilePage, initialHeroPage, initialModelPage, initialProfilePage } from './../models/profile';

/**
 * The compose function is one of our most handy tools. In basic terms, you give
 * it any number of functions and it returns a function. This new function
 * takes a value and chains it through every composed function, returning
 * the output.
 *
 * More: https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch5.html
 */
import { compose } from '@ngrx/store';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

/**
 * combineReducers is another useful metareducer that takes a map of reducer
 * functions and creates a new reducer that gathers the values
 * of each reducer and stores them using the reducer's key. Think of it
 * almost like a database, where every reducer is a table in the db.
 *
 * More: https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch
 */
import { combineReducers } from '@ngrx/store';


/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */
import { getValue, setValue } from 'nygma-forms';
import * as fromHero from './hero.reducer';
import * as fromProfile from './profile.reducer';
import * as fromStandard from './standard.reducer';


/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface ApplicationState {
  profile: ProfilePage;
  hero: HeroPage;
  model: ModelPage;
}

export const initialState: ApplicationState = {
  profile: initialProfilePage,
  hero: initialHeroPage,
  model: initialModelPage,
}

/**
 * Because metareducers take a reducer function and return a new reducer,
 * we can use our compose helper to chain them together. Here we are
 * using combineReducers to make our top level reducer, and then
 * wrapping that in storeLogger. Remember that compose applies
 * the result from right to left.
 */
const reducers = {
  profile: fromProfile.profileReducer,
  hero: fromHero.profileReducer,
  model: fromStandard.profileReducer
};

const developmentReducer: ActionReducer<ApplicationState> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<ApplicationState> = combineReducers(reducers);

export const global = () => (reducer: ActionReducer<any>): any => {
  return (state: any, action: any) => {
    let newState = reducer(state, action);

    if(action.type === '@ngrx/store/slice/property/update') {
      newState = setValue(newState, `${action.path}.${action.property}`, action.value);
    }

    return newState;
  }
}

export function rootReducer(state = initialState, action: any) {

  if (environment.production) {
    // suppress console output
    console.log = function () { Function.prototype };

    return productionReducer(state, action);

  } else {
    return developmentReducer(state, action);
  }

}

export const selectSlice = (slice: string) => createSelector((state: any) => getValue(state, slice), state => state);
export const selectProperty = (slice: string, property: string) => createSelector((state: any) => getValue(state, `${slice}.${property}`), state => state);
export const updateProperty = createAction('@ngrx/store/slice/property/update', props<{ path: string; property: string; value: any; }>());
