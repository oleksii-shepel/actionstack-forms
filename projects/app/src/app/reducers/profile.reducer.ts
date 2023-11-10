import { Action } from '@ngrx/store';
import { ProfilePage } from '../models/profile';



export function profileReducer(state: any, action: Action): ProfilePage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
