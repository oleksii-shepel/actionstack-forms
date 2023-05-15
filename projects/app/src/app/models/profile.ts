import { ModelOptions } from "@ngrx/forms";

export interface Profile {
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  aliases: string[];
}

export const initialProfile: Profile = {
  firstName: 'asdasd',
  lastName: 'sadfsafas',
  address: {
    street: 'sadfsadf',
    city: 'dasfasdf',
    state: 'asdfsadf',
    zip: 'asdfsdaf'
  },
  aliases: ['asdfasdf']
}

export const options: ModelOptions<Profile> = {
  firstName: {},
  lastName: {},
  address: {
    street: {},
    city: {},
    state: {},
    zip: {},
  },
  aliases: {'0':{}}
}
