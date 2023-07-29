import { AutoInit, AutoSubmit, FormDestroyed, UpdateDirty, UpdateErrors, UpdateField, UpdateForm, UpdateStatus } from '../lib/actions';
import { forms, logger } from '../lib/reducers';
import { deepClone } from '../public-api';

describe('reducers', () => {
  it('should log', () => {
    const log = logger({showAll: true});
    const logSpy = jest.spyOn(console, 'log');
    const state = { test: 'test' };
    log((state: any, action: any) => {
      return { ...state, test: 'test2' };
    })(state, UpdateForm({split: 'test::form', value: 'test'}));
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
        form: {
          value: model,
          submitted: false,
          status: 'INVALID',
          errors: {maxLength: "Field is too long"},
          dirty: false,
        }
      }
    };

    const f = forms(initialState);
    let expected = {} as any;

    let newState = f((state: any, action: any) => { return state; })(initialState, AutoInit({split: "slice::form", value: model}));
    expected = { slice: { form: { model }} };
    expect(newState.model).toEqual(expected.model);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateForm({split: "slice::form", value: model}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateField({split: "slice::form::email", value: model.email}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateStatus({split: "slice::form", status: "VALID"}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].status = "VALID";
    expect(newState).toEqual(expected);

    const errors = {required: "Field is required", email: "Email is invalid"};
    newState = f((state: any, action: any) => { return state; })(initialState, UpdateErrors({split: "slice::form", errors: errors}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].errors = errors;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateDirty({split: "slice::form", dirty: true}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].dirty = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, AutoSubmit({split: "slice::form"}));
    expected = deepClone(initialState); (expected as any)['slice']['form'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, FormDestroyed({split: "slice::form"}));
  });
});
