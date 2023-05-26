import { Action } from '@ngrx/store';

export enum FormActions {
  InitForm        = '[Form] Init',
  ResetForm       = '[Form] Reset',
  UpdateForm      = '[Form] Update Form',
  UpdateValue     = '[Form] Update Value',
  UpdateStatus    = '[Form] Update Status',
  UpdateDirty     = '[Form] Update Dirty',
  UpdateErrors    = '[Form] Update Errors',
  UpdateSubmitted = '[Form] Update Submitted',
}

export class InitForm implements Action {
  readonly type = FormActions.InitForm;
  constructor(public payload: { path: string; value: any; opts?: any }) {}
}

export class UpdateFormStatus implements Action {
  readonly type = FormActions.UpdateStatus;
  constructor(public payload: { path: string; status: string | null }) {}
}

export class UpdateFormValue implements Action {
  readonly type = FormActions.UpdateValue;
  constructor(public payload: { path: string; value: any }) {}
}

export class UpdateForm implements Action {
  readonly type = FormActions.UpdateForm;
  constructor(
    public payload: {
      path: string;
      value: any;
      errors: { [k: string]: string } | null;
      dirty: boolean | null;
      status: string | null;
    }
  ) {}
}

export class UpdateFormDirty implements Action {
  readonly type = FormActions.UpdateDirty;
  constructor(public payload: { path: string; dirty: boolean | null; }) {}
}

export class UpdateFormErrors implements Action {
  readonly type = FormActions.UpdateErrors;
  constructor(public payload: { path: string; errors: { [k: string]: string } | null }) {}
}

export class ResetForm implements Action {
  readonly type = FormActions.ResetForm;
  constructor(public payload: { path: string; value: any }) {}
}

export class UpdateSubmitted implements Action {
  readonly type = FormActions.UpdateSubmitted;
  constructor(public payload: { path: string, value: boolean }) {}
}
