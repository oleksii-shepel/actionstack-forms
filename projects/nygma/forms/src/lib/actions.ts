import { ActionCreatorProps, createAction, props } from '@ngrx/store';
import { ActionCreator, NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
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

export const actionArray = (Object.values(FormActions) as string[]).concat(Object.values(FormActionsInternal));
export const actionMapping = new Map<string, FormAction<string>>();
export const actionQueues = new Map<string, Queue<FormAction<string>>>();

export interface FormAction<T extends string> extends ActionCreator<T, () => TypedAction<T>> {
  type: T;
  deferred: boolean;
  execute: (state: any) => any;
}

function actionFactory<P extends object>(type: string, fn?: (state: any) => any): any {
  const action = createAction<string, P>(type, props<{ _as: 'props', _p: P }>() as ActionCreatorProps<P> & NotAllowedCheck<P>);
  const func = fn? fn : (state: any): any => { return state; };
  const obj = Object.assign(action, { deferred: false, execute: func }) as any;
  actionMapping.set(type, obj);
  return obj;
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
