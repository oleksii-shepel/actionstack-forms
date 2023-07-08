import { Action, createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '@nygma/forms/update',
  UpdateField = '@nygma/forms/field/update',
  ResetForm = '@nygma/forms/reset',
}

export enum FormActionsInternal {
  UpdateStatus = '@nygma/forms/internal/status/update',
  UpdateDirty = '@nygma/forms/internal/dirty/update',
  UpdateErrors = '@nygma/forms/internal/errors/update',
  AutoInit = '@nygma/forms/internal/init',
  AutoSubmit = '@nygma/forms/internal/submit',
  FormDestroyed = '@nygma/forms/internal/destroyed',
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
  props<{ split: string; errors: Record<string, string>; }>()
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

export class Deferred implements Action {
  type!: string;
  deferred = true;

  constructor(action: Action) {
    Object.assign(this, action);
  }
}
