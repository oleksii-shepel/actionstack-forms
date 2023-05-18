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
  aliases: [''],
}

export const profileOptions: ModelOptions<Profile> = {
  firstName: {},
  lastName: {},
  address: {
    street: {},
    city: {},
    state: {},
    zip: {},
  },
  aliases: [{}]
}

export interface Hero {
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

export const initialHero: Hero = {
  firstName: '',
  lastName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  aliases: [''],
}

export const heroOptions: ModelOptions<Profile> = {
  firstName: {},
  lastName: {},
  address: {
    street: {},
    city: {},
    state: {},
    zip: {},
  },
  aliases: [{}]
}

export interface Model {
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

export const initialModel: Model = {
  firstName: '',
  lastName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  aliases: [''],
}

export const modelOptions: ModelOptions<Model> = {
  firstName: {},
  lastName: {},
  address: {
    street: {},
    city: {},
    state: {},
    zip: {},
  },
  aliases: [{}]
}

