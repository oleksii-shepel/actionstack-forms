import { Action, createAction, props } from '@ngrx/store';

export enum FormActions {
  InitForm = '[Form] Init Form',
  UpdateForm = '[Form] Update Form',
  UpdateSubmitted = '[Form] Update Submitted',
  UpdateModelProperty = '[Form] Update Model',
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

export const InitForm = createAction(
  FormActions.InitForm,
  props<{ path: string; value: any; }>()
);

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; }>()
);

export const UpdateModelProperty = createAction(
  FormActions.UpdateModelProperty,
  props<{ path: string; value: any; }>()
);

export const UpdateSubmitted = createAction(
  FormActions.UpdateSubmitted,
  props<{ path: string; submitted: boolean; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ path: string; state: 'initial' | 'submitted' | 'blank'}>()
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
  props<{ path: string; errors: Record<string, string>; }>()
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
  deferred: boolean = true;

  constructor(action: Action) {
    Object.assign(this, action);
  }
}
