import { createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '[Form] Update Form',
  AutoInit = '[Form] Auto Init',
}

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; }>()
);

export const AutoInit = createAction(
  FormActions.AutoInit,
  props<{ path: string; value: any; }>()
);
