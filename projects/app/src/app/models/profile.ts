import { ModelOptions } from "ngync";

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
  firstName: 'Ian',
  lastName: 'Fleming',
  address: {
    street: 'Mayfair',
    city: 'London',
    state: 'England',
    zip: 'W1J'
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
  firstName: 'James',
  lastName: 'Bond',
  address: {
    street: '',
    city: 'Ao Phang Nga National Park',
    state: 'Phangnga',
    zip: '82130'
  },
  aliases: ['Mr Fisher', 'Robert Sterling', 'St. John Smyth'],
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
  aliases: [{}, {}, {}]
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
  firstName: 'Dominique',
  lastName: 'Derval',
  address: {
    street: '',
    city: 'Nassau',
    state: 'The Bahamas, New Providence Island',
    zip: '00000'
  },
  aliases: ['Domino'],
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

