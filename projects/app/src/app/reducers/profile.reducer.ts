import { Action } from '@actioncrew/actionstack';
import { ProfilePage, initialProfilePage } from '../models/profile';



export function profileReducer(state: any = initialProfilePage, action: Action): ProfilePage {
  switch (action.type) {
    default: {
      return state;
    }
  }
}
