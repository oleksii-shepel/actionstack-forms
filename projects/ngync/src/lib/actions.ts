import { createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@forms/update',
}

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; }>()
);
