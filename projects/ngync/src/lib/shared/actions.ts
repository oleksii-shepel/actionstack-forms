import { createAction, props } from '@ngrx/store';

export enum FormActions {
  InitForm = '[Form] Init',
  ResetForm = '[Form] Reset',
  UpdateValue = '[Form] Update Value',
  UpdateSubmitted = '[Form] Update Submitted',
}

export enum FormActionsInternal {
  UpdateStatus = '[Form] Update Status',
  UpdateDirty = '[Form] Update Dirty',
  UpdateErrors = '[Form] Update Errors',
  AutoSubmit = '[Form] Auto Submit',
}

export const InitForm = createAction(
  FormActions.InitForm,
  props<{ path: string; value: any; opts?: any; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ path: string; value: any; }>()
);

export const UpdateValue = createAction(
  FormActions.UpdateValue,
  props<{ path: string; value: any; }>()
);

export const UpdateStatus = createAction(
  FormActionsInternal.UpdateStatus,
  props<{ path: string; status: string | null; }>()
);

export const UpdateDirty = createAction(
  FormActionsInternal.UpdateDirty,
  props<{ path: string; dirty: boolean | null; }>()
);

export const UpdateErrors = createAction(
  FormActionsInternal.UpdateErrors,
  props<{ path: string; errors: { [k: string]: string } | null; }>()
);

export const UpdateSubmitted = createAction(
  FormActions.UpdateSubmitted,
  props<{ path: string; value: boolean; }>()
);

export const AutoSubmit = createAction(
  FormActionsInternal.AutoSubmit,
  props<{ path: string; }>()
);

