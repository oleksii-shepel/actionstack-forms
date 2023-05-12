import { AbstractControlOptions } from "@angular/forms";
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
  firstName: '',
  lastName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  aliases: ['']
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
