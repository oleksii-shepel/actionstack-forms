import { Action } from '@ngrx/store';
import { ProfilePage, initialProfilePage } from '../models/profile';



export function profileReducer(state = initialProfilePage, action: Action): ProfilePage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
