import { ValidationErrors } from '@angular/forms';
import { createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@forms/form/update',
  UpdateField = '@forms/form/field/update',
  ResetForm = '@forms/form/reset',
}

export enum FormActionsInternal {
  UpdateReference = '@forms/internal/reference/update',
  UpdateStatus = '@forms/internal/status/update',
  UpdateDirty = '@forms/internal/dirty/update',
  UpdateErrors = '@forms/internal/errors/update',
  AutoInit = '@forms/internal/form/init',
  AutoSubmit = '@forms/internal/form/submit',
  FormDestroyed = '@forms/internal/form/destroyed',
}

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ split: string; value: any; }>()
);

export const UpdateField = createAction(
  FormActions.UpdateField,
  props<{ split: string; value: any; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ split: string; state: 'initial' | 'submitted' | 'blank'}>()
);

export const UpdateReference = createAction(
  FormActionsInternal.UpdateReference,
  props<{ split: string; value: any; }>()
);


export const UpdateStatus = createAction(
  FormActionsInternal.UpdateStatus,
  props<{ split: string; status: string; }>()
);

export const UpdateDirty = createAction(
  FormActionsInternal.UpdateDirty,
  props<{ split: string; dirty: boolean; }>()
);

export const UpdateErrors = createAction(
  FormActionsInternal.UpdateErrors,
  props<{ split: string; errors: ValidationErrors | null }>()
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
