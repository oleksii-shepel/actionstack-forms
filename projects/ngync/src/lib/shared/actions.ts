import { Action, createAction, props } from '@ngrx/store';
import { deepClone } from './utils';

export enum FormActions {
  InitForm = '[Form] Init Form',
  UpdateForm = '[Form] Update Form',
  UpdateSubmitted = '[Form] Update Submitted',
  UpdateModel = '[Form] Update Model',
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

export const UpdateModel = createAction(
  FormActions.UpdateModel,
  props<{ path: string; value: any; }>()
);

export const UpdateSubmitted = createAction(
  FormActions.UpdateSubmitted,
  props<{ path: string; value: boolean; }>()
);

export const ResetForm = createAction(
  FormActions.ResetForm,
  props<{ path: string; value: 'initial' | 'submitted' | 'blank'}>()
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

export const FormDestroyed = createAction(
  FormActionsInternal.FormDestroyed,
  props<{ path: string; }>()
);

export class Deferred implements Action {
  deferred: boolean = true;
  type: string = 'Deferred';

  constructor(action: Action) {
    Object.assign(this, action);
  }

  toAction(): Action {
    let action = deepClone(this);
    delete action.deferred;
    return action;
  }
}
