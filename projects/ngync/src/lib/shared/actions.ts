import { createAction, props } from '@ngrx/store';

export enum FormActions {
  InitForm = '[Form] Init Form',
  UpdateForm = '[Form] Update Form',
  UpdateSubmitted = '[Form] Update Submitted',
}

export enum FormActionsInternal {
  ResetForm = '[Form] Reset Form',
  UpdateModel = '[Form] Update Value',
  UpdateStatus = '[Form] Update Status',
  UpdateDirty = '[Form] Update Dirty',
  UpdateErrors = '[Form] Update Errors',
  AutoInit = '[Form] Auto Init',
  AutoSubmit = '[Form] Auto Submit',
}

export const InitForm = createAction(
  FormActions.InitForm,
  props<{ path: string; value: any; }>()
);

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{ path: string; value: any; }>()
);

export const UpdateModel = createAction(
  FormActionsInternal.UpdateModel,
  props<{ path: string; value: any; }>()
);

export const UpdateSubmitted = createAction(
  FormActions.UpdateSubmitted,
  props<{ path: string; value: boolean; }>()
);

export const ResetForm = createAction(
  FormActionsInternal.ResetForm,
  props<{ path: string; value: any; resetState?: any }>()
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

export const AutoInit = createAction(
  FormActionsInternal.AutoInit,
  props<{ path: string; value: any; }>()
);

export const AutoSubmit = createAction(
  FormActionsInternal.AutoSubmit,
  props<{ path: string; }>()
);

