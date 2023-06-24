import { AutoInit, AutoSubmit, InitForm, ResetForm, UpdateDirty, UpdateErrors, UpdateForm, UpdateModel, UpdateStatus, UpdateSubmitted } from '../lib/shared/actions';
import { forms } from '../lib/shared/reducers';
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
    let expected = {};

    let newState = f((state: any, action: any) => {})(initialState, InitForm({path: "slice", value: model}));
    expected = { slice: { model } };
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateForm({path: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'].model = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateSubmitted({path: "slice", value: true}));
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateModel({path: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'].model = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, ResetForm({path: "slice", value: 'initial'}));
    expect(newState).toEqual(newState);

    newState = f((state: any, action: any) => {})(initialState, UpdateStatus({path: "slice", status: "VALID"}));
    expected = deepClone(initialState); (expected as any)['slice'].status = "VALID";
    expect(newState).toEqual(expected);

    let errors = {required: "Field is required", email: "Email is invalid"};
    newState = f((state: any, action: any) => {})(initialState, UpdateErrors({path: "slice", errors: errors}));
    expected = deepClone(initialState); (expected as any)['slice'].errors = errors;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, UpdateDirty({path: "slice", dirty: true}));
    expected = deepClone(initialState); (expected as any)['slice'].dirty = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, AutoInit({path: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'] = { model };
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => {})(initialState, AutoSubmit({path: "slice"}));
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);
  });
});
