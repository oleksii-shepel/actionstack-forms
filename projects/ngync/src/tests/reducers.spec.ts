import { AutoInit, AutoSubmit, FormDestroyed, ResetForm, UpdateDirty, UpdateErrors, UpdateForm, UpdateProperty, UpdateStatus } from '../lib/shared/actions';
import { forms } from '../lib/shared/reducers';
import { deepClone } from '../public-api';

describe('reducer', () => {
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
        model: model,
        submitted: false,
        status: 'INVALID',
        errors: {maxLength: "Field is too long"},
        dirty: false,
      }
    };

    const f = forms(initialState);
    let expected = {} as any;

    let newState = f((state: any, action: any) => { Function.prototype })(initialState, AutoInit({path: "slice", value: model}));
    expected = { slice: { model } };
    expect(newState.model).toEqual(expected.model);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, UpdateForm({path: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, UpdateProperty({path: "slice", value: model}));
    expected = deepClone(initialState); (expected as any)['slice'].value = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, ResetForm({path: "slice", state: 'initial'}));
    expect(newState).toEqual(newState);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, UpdateStatus({path: "slice", status: "VALID"}));
    expected = deepClone(initialState); (expected as any)['slice'].status = "VALID";
    expect(newState).toEqual(expected);

    const errors = {required: "Field is required", email: "Email is invalid"};
    newState = f((state: any, action: any) => { Function.prototype })(initialState, UpdateErrors({path: "slice", errors: errors}));
    expected = deepClone(initialState); (expected as any)['slice'].errors = errors;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, UpdateDirty({path: "slice", dirty: true}));
    expected = deepClone(initialState); (expected as any)['slice'].dirty = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, AutoSubmit({path: "slice"}));
    expected = deepClone(initialState); (expected as any)['slice'].submitted = true;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { Function.prototype })(initialState, FormDestroyed({path: "slice"}));
  });
});
