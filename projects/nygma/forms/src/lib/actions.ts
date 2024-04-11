import { Action, action } from '@actioncrew/actionstack';
import { Queue } from './queue';
import { deepClone, setValue } from './utils';

export enum FormActions {
  UpdateForm = '@forms/form/update',
  UpdateFormSuccess = '@forms/form/update/success',
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

function actionFactory<P extends object>(type: string, reducer = (state: any = {}): any => { return state; }): any {
  const creator = action(type, (params: P) => ({...params, deferred: false, execute: reducer}));
  actionMapping.set(type, creator);
  return creator;
}

export const updateForm = actionFactory<{ path: string; value: any; noclone?: boolean; }>(FormActions.UpdateForm, function(this: any, state: any) {
  if(!state.__form) {
    console.warn(`Seems like sync directive is not initialized at this point in time, consider putting form update in a ngAfterViewInit hook`);
  }
  const newState = !this.noclone ? deepClone(this.value) : {...this.value};
  newState.__form = true;

  return newState;
});

export const updateFormSuccess = actionFactory<{ path: string; value: any; }>(FormActions.UpdateFormSuccess);

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
  return Object.assign({...action, payload: {deferred: true}});
};

export const dequeued = (action: Action<any>): any => {
  return Object.assign({...action, payload: {dequeued: true}});
};
