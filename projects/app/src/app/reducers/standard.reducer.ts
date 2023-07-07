import { Action } from '@ngrx/store';
import { Model, initialModel } from '../models/profile';



export type ModelState = Model



export const initialState: ModelState = initialModel;



export function profileReducer(state = initialState, action: Action): ModelState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
