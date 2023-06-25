import { AutoInit, AutoSubmit, FormDestroyed, InitForm, ResetForm, UpdateDirty, UpdateErrors, UpdateForm, UpdateModel, UpdateStatus, UpdateSubmitted } from '../lib/shared/actions';
import { actionQueues, forms } from '../lib/shared/reducers';
import { deepClone } from '../public-api';

describe('reducer', () => {
  it('should handle actions', () => {
    let model = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@contoso.com',
      address: {
        street: '123 Main St.',
        city: 'Anytown',
        state: 'CA',
        zip: '',
      },
      aliases: ['Johny', 'Johnny'],
    };

    let initialState = {
      slice: {
        model: model,
        submitted: false,
        status: 'INVALID',
        errors: {maxLength: "Field is too long"},
        dirty: false,
      }
    };

    let f = forms(initialState, false);
    let expected = {} as any;

    let newState = f((state: any, action: any) => {})(initialState, InitForm({path: "slice", value: model}));
    delete newState.slice.action;
    expected = { slice: { model } };
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateForm({path: "slice", value: model}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].model = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateSubmitted({path: "slice", value: true}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateModel({path: "slice", value: model}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].model = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, ResetForm({path: "slice", value: 'initial'}));
    delete newState.slice.action;
    expect(newState).toEqual(newState);

    newState = f((state: any, action: any) => {})(initialState, UpdateStatus({path: "slice", status: "VALID"}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].status = "VALID";
    expect(newState).toEqual(expected);

    let errors = {required: "Field is required", email: "Email is invalid"};
    newState = f((state: any, action: any) => {})(initialState, UpdateErrors({path: "slice", errors: errors}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].errors = errors;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateDirty({path: "slice", dirty: true}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].dirty = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, AutoInit({path: "slice", value: model}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'] = { model };
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, AutoSubmit({path: "slice"}));
    delete newState.slice.action;
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, FormDestroyed({path: "slice"}));
    expect(actionQueues.get('slice')).toBeUndefined();
  });
});
