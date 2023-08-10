import { AutoInit, AutoSubmit, FormDestroyed, UpdateField, UpdateForm } from '../lib/actions';
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
        form: model
      }
    };

    const f = forms(initialState);
    let expected = {} as any;

    let newState = f((state: any, action: any) => { return state; })(initialState, AutoInit({split: "slice::form", value: model}));
    expected = { slice: { form: { model }} };
    expect(newState.model).toEqual(expected.model);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateForm({split: "slice::form", value: model}));
    expected = deepClone(initialState); (expected as any)['slice']['form'] = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateField({split: "slice::form::email", value: model.email}));
    expected = deepClone(initialState); (expected as any)['slice']['form'] = model;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, AutoSubmit({split: "slice::form"}));

    newState = f((state: any, action: any) => { return state; })(initialState, FormDestroyed({split: "slice::form"}));
  });
});
