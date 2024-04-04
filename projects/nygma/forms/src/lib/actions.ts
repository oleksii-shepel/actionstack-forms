import { Action, action } from '@actioncrew/actionstack';
import { Queue } from './queue';
import { deepClone, setValue } from './utils';

export enum FormActions {
  UpdateForm = '@forms/form/update',
  UpdateControl = '@forms/form/control/update',
}

export enum FormActionsInternal {
  AutoInit = '@forms/form/init',
  AutoSubmit = '@forms/form/submit',
  FormDestroyed = '@forms/form/destroyed',
}

export const actionMapping = new Map<string, (props: any) => object>();
export const actionQueues = new Map<string, Queue<FormAction>>();

export interface FormAction {
  type: string;
  execute: (state: any) => any;
}

function actionFactory<P extends object>(type: string, reducer?: (state: any) => any): any {
  let creator = action(type);
  const func = reducer? reducer : (state: any): any => { return state; };
  creator = Object.assign(creator, { deferred: false, execute: func });
  const higherOrderAction = (props: P) => creator({...creator, ...props});
  actionMapping.set(type, higherOrderAction);
  return higherOrderAction;
}

export const updateForm = actionFactory<{ path: string; value: any; noclone?: boolean; }>(FormActions.UpdateForm, function(this: any, state: any) {
  if(!state.__form) {
    console.warn(`Seems like sync directive is not initialized at this point in time, consider putting form update in a ngAfterViewInit hook`);
  }
  const newState = !this.noclone ? deepClone(this.value) : {...this.value};
  newState.__form = true;

  return newState;
});

export const updateControl = actionFactory<{ path: string; property: string; value: any; }>(FormActions.UpdateControl, function(this: any, state: any) {
  if(!state.__form) {
    console.warn(`Seems like sync directive is not initialized at this point in time, consider putting form update in a ngAfterViewInit hook`);
  }
  const newState = setValue(state, this.property, this.value);
  newState.__form = true;

  return newState;
});

export const autoInit = actionFactory<{ path: string; value: any; noclone?: boolean; }>(FormActionsInternal.AutoInit, function(this: any, state: any) {
  const newState = !this.noclone ? deepClone(this.value) : {...this.value};
  newState.__form = true;

  return newState;
});

export const autoSubmit = actionFactory<{ path: string; }>(FormActionsInternal.AutoSubmit);

export const formDestroyed = actionFactory<{ path: string; value: any; }>(FormActionsInternal.FormDestroyed);

export const deferred = (action: Action<any>): any => {
  return Object.assign({...action}, {deferred: true});
};

export const dequeued = (action: Action<any>): any => {
  return Object.assign({...action}, {dequeued: true});
};
