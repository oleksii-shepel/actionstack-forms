import { ValidationErrors } from '@angular/forms';
import { Action, createAction, props } from '@ngrx/store';

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
  props<{ path: string; value: any; }>()
);

export const UpdateField = createAction(
  FormActions.UpdateField,
  props<{ path: string; property: string; value: any; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ path: string; state: 'initial' | 'submitted' | 'blank'}>()
);

export const UpdateReference = createAction(
  FormActionsInternal.UpdateReference,
  props<{ path: string; value: any; }>()
);


export const UpdateStatus = createAction(
  FormActionsInternal.UpdateStatus,
  props<{ path: string; status: string; }>()
);

export const UpdateDirty = createAction(
  FormActionsInternal.UpdateDirty,
  props<{ path: string; dirty: boolean; }>()
);

export const UpdateErrors = createAction(
  FormActionsInternal.UpdateErrors,
  props<{ path: string; errors: ValidationErrors | null }>()
);

export const AutoInit = createAction(
  FormActionsInternal.AutoInit,
  props<{ path: string; value: any; }>()
);

export const AutoSubmit = createAction(
  FormActionsInternal.AutoSubmit,
  props<{ path: string; }>()
);

export const FormDestroyed = createAction(
  FormActionsInternal.FormDestroyed,
  props<{ path: string; }>()
);

export class Deferred implements Action {
  type!: string;
  deferred = true;

  constructor(action: Action) {
    Object.assign(this, action);
  }
}
