import { AutoInit, AutoSubmit, FormDestroyed, ResetForm, UpdateDirty, UpdateErrors, UpdateField, UpdateForm, UpdateStatus } from '../lib/actions';
import { forms, logger } from '../lib/reducers';
import { deepClone } from '../public-api';

describe('reducers', () => {
  it('should log', () => {
    const log = logger({showAll: true});
    const logSpy = jest.spyOn(console, 'log');
    const state = { test: 'test' };
    log((state: any, action: any) => {
      state = { ...state, test: 'test2' };
    })(state, UpdateForm({split: 'test', value: 'test'}));
    expect(logSpy).toHaveBeenCalledTimes(2);
  });
  it('should handle actions', () => {
    const model = {
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

    const initialState = {
      slice: {
        value: model,
        submitted: false,
        status: 'INVALID',
        errors: {maxLength: "Field is too long"},
        dirty: false,
      }
    };

    const f = forms(initialState);
    let expected = {} as any;

    let newState = f((state: any, action: any) => { return state; })(initialState, AutoInit({split: "slice", value: model}));
    expected = { slice: { model } };
    expect(newState.model).toEqual(expected.model);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateForm({split: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateField({split: "slice", property: "email", value: model.email}));
    expected = deepClone(initialState); (expected as any)['slice'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, ResetForm({split: "slice", state: 'initial'}));
    expect(newState).toEqual(newState);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateStatus({split: "slice", status: "VALID"}));
    expected = deepClone(initialState); (expected as any)['slice'].status = "VALID";
    expect(newState).toEqual(expected);

    const errors = {required: "Field is required", email: "Email is invalid"};
    newState = f((state: any, action: any) => { return state; })(initialState, UpdateErrors({split: "slice", errors: errors}));
    expected = deepClone(initialState); (expected as any)['slice'].errors = errors;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateDirty({split: "slice", dirty: true}));
    expected = deepClone(initialState); (expected as any)['slice'].dirty = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, AutoSubmit({split: "slice"}));
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, FormDestroyed({split: "slice"}));
  });
});
