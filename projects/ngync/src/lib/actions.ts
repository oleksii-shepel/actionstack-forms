import { createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@forms/form/update',
}

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; }>()
);
