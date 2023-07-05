import { Action, createAction, props } from '@ngrx/store';

export enum FormActions {
  UpdateForm = '[Form] Update Form',
  UpdateField = '[Form] Update Form Field',
  ResetForm = '[Form] Reset Form',
}

export enum FormActionsInternal {
  UpdateStatus = '[Form] Update Status',
  UpdateDirty = '[Form] Update Dirty',
  UpdateErrors = '[Form] Update Errors',
  AutoInit = '[Form] Auto Init',
  AutoSubmit = '[Form] Auto Submit',
  FormDestroyed = '[Form] Form Destroyed',
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
