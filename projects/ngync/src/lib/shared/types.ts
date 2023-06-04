import { AbstractControlOptions } from "@angular/forms";


export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
      ? Subset<K[attr]>
      : K[attr] extends object | null
      ? Subset<K[attr]> | null
      : K[attr] extends object | null | undefined
      ? Subset<K[attr]> | null | undefined
      : K[attr];
};



export type ArrayToObject<T extends any[]> = {
  [key in keyof T as string]?: T[key];
}


export type Extract<T, V> = { [key in keyof T]: T[key] extends V ? key : never }[keyof T]
export type Select<Base, Condition> = Pick<Base, Extract<Base, Condition>>;



export type KeyCount<Obj, Cache extends any[] = []> = keyof Obj extends never ? Cache['length'] : {
  [Prop in keyof Obj]: KeyCount<Omit<Obj, Prop>, [...Cache, Prop]>
}[keyof Obj]



export type ModelOptions<T> =
T extends Array<infer U> ? ArrayToObject<ModelOptions<U>[]> & {
  ["__group"]?: T extends object ? AbstractControlOptions : never;
} : T extends object ? {
  [key in keyof Partial<T>]? : ModelOptions<T[key]>;
} & {
  ["__group"]?: AbstractControlOptions;
} : AbstractControlOptions;

