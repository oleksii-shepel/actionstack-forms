import { AutoInit, AutoSubmit, FormDestroyed, UpdateField, UpdateForm } from '../lib/actions';
import { forms, logger } from '../lib/reducers';

describe('reducers', () => {
  it('should log', () => {
    const log = logger({showAll: true});
    const logSpy = jest.spyOn(console, 'log');
    const state = { test: 'test' };
    log((state: any, action: any) => {
      return { ...state, test: 'test2' };
    })(state, UpdateForm({path: 'test.form', value: 'test'}));
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

    let initialState = {
      slice: {
        form: model
      }
    };

    const f = forms(initialState);
    let expected = {} as any;

    let newState = f((state: any, action: any) => { return state; })(initialState, AutoInit({path: "slice.form", value: model}));
    expected = { slice: { form: { ...model, __form: true }} }; initialState = newState;
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateForm({path: "slice.form", value: model}));
    expected = { slice: { form: { ...model, __form: true }} };
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, UpdateField({path: "slice.form", property: "email", value: model.email}));
    expected = { slice: { form: { ...model, __form: true }} }
    expect(newState).toEqual(expected);

    newState = f((state: any, action: any) => { return state; })(initialState, AutoSubmit({path: "slice.form"}));

    newState = f((state: any, action: any) => { return state; })(initialState, FormDestroyed({path: "slice.form"}));
  });
});
