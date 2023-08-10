import { createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@forms/form/update',
  UpdateField = '@forms/form/field/update',
}

export enum FormActionsInternal {
  AutoInit = '@forms/form/internal/init',
  AutoSubmit = '@forms/form/internal/submit',
  FormDestroyed = '@forms/form/internal/destroyed',
}

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ split: string; value: any; }>()
);

export const UpdateField = createAction(
  FormActions.UpdateField,
  props<{ split: string; value: any; }>()
);

export const AutoInit = createAction(
  FormActionsInternal.AutoInit,
  props<{ split: string; value: any; }>()
);

export const AutoSubmit = createAction(
  FormActionsInternal.AutoSubmit,
  props<{ split: string; }>()
);

export const FormDestroyed = createAction(
  FormActionsInternal.FormDestroyed,
  props<{ split: string; }>()
);
