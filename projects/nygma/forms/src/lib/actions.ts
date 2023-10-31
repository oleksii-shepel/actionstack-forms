import { Action, createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@forms/form/update',
  UpdateField = '@forms/form/field/update',
}

export enum FormActionsInternal {
  AutoInit = '@forms/form/init',
  AutoSubmit = '@forms/form/submit',
  FormDestroyed = '@forms/form/destroyed',
}

export const ActionArray = (Object.values(FormActions) as any[]).concat(Object.values(FormActionsInternal));

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; noclone?: boolean}>()
);

export const UpdateField = createAction(
  FormActions.UpdateField,
  props<{ path: string; property: string; value: any; }>()
);

export const AutoInit = createAction(
  FormActionsInternal.AutoInit,
  props<{ path: string; value: any; noclone?: boolean}>()
);

export const AutoSubmit = createAction(
  FormActionsInternal.AutoSubmit,
  props<{ path: string; }>()
);

export const FormDestroyed = createAction(
  FormActionsInternal.FormDestroyed,
  props<{ path: string; value: any; }>()
);

export class Deferred implements Action {
  type!: string;
  deferred = true;

  constructor(action: Action) {
    Object.assign(this, action);
  }
}
