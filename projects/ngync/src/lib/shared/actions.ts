import { createAction, props } from '@ngrx/store';

export enum FormActions {
  InitForm = '[Form] Init',
  ResetForm = '[Form] Reset',
  UpdateForm = '[Form] Update Form',
  UpdateValue = '[Form] Update Value',
  UpdateStatus = '[Form] Update Status',
  UpdateDirty = '[Form] Update Dirty',
  UpdateErrors = '[Form] Update Errors',
  UpdateSubmitted = '[Form] Update Submitted',
}

export const InitForm = createAction(
  FormActions.InitForm,
  props<{ path: string; value: any; opts?: any; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ path: string; value: any; }>()
);

export const UpdateForm = createAction(
  FormActions.UpdateForm,
  props<{
    path: string;
    value: any;
    errors: { [k: string]: string } | null;
    dirty: boolean | null;
    status: string | null;
  }>()
);

export const UpdateValue = createAction(
  FormActions.UpdateValue,
  props<{ path: string; value: any; }>()
);

export const UpdateStatus = createAction(
  FormActions.UpdateStatus,
  props<{ path: string; status: string | null; }>()
);

export const UpdateDirty = createAction(
  FormActions.UpdateDirty,
  props<{ path: string; dirty: boolean | null; }>()
);

export const UpdateErrors = createAction(
  FormActions.UpdateErrors,
  props<{ path: string; errors: { [k: string]: string } | null; }>()
);

export const UpdateSubmitted = createAction(
  FormActions.UpdateSubmitted,
  props<{ path: string; value: boolean; }>()
);
