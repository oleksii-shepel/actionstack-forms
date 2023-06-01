import { ModelOptions } from "ngync";

export interface Profile {
  bookmark: boolean;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  selected: number;
  books: string[];
  quotes: string;
  aliases: string[];
}

export const initialProfile: Profile = {
  bookmark: false,
  firstName: 'Ian',
  lastName: 'Fleming',
  address: {
    street: 'Mayfair',
    city: 'London',
    state: 'England',
    zip: 'W1J'
  },
  selected: 0,
  books: [
    'Casino Royale',
    'Live and Let Die',
    'Moonraker',
    'Diamonds Are Forever',
    'From Russia, with Love',
    'Dr. No',
    'Goldfinger',
    'For Your Eyes Only',
    'Thunderball',
    'The Spy Who Loved Me',
    'On Her Majesty\'s Secret Service',
    'You Only Live Twice',
  ],
  quotes:
`❝ Never say 'no' to adventures. Always say 'yes,' otherwise, you'll lead a very dull life.
❝ The distance between insanity and genius is measured only by success.
❝ A woman can put up with almost anything; anything but indifference.
❝ I think it's the same with all the relationships between a man and a woman. They can survive anything so long as some kind of basic humanity exists between the two people. When all kindness has gone, when one person obviously and sincerely doesn't care if the other is alive or dead, then it's just no good.
❝ Everyone has the revolver of resignation in his pocket.`,
  aliases: [''],
}

export const profileOptions: ModelOptions<Profile> = {
  bookmark: {},
  firstName: {},
  lastName: {},
  address: {
    street: {},
    city: {},
    state: {},
    zip: {},
  },
  selected: {},
  books: [],
  quotes: {},
  aliases: []
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

