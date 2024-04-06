import { autoInit, autoSubmit, formDestroyed, updateControl, updateForm } from '../lib/actions';
import { forms } from '../lib/reducers';

describe('reducers', () => {
  it('should handle actions', async() => {
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

    const f = forms(initialState)((state: any, action: any) => { return state; });
    let expected = {} as any;

    let newState = f(initialState, autoInit({path: "slice.form", value: model}));
    expected = { slice: { form: { ...model, __form: true }} }; initialState = newState;
    expect(newState).toEqual(expected);

    newState = f(initialState, updateForm({path: "slice.form", value: model}));
    expected = { slice: { form: { ...model, __form: true }} };
    expect(newState).toEqual(expected);

    newState = f(initialState, updateControl({path: "slice.form", property: "email", value: model.email}));
    expected = { slice: { form: { ...model, __form: true }} }
    expect(newState).toEqual(expected);

    newState = f(initialState, autoSubmit({path: "slice.form"}));

    newState = f(initialState, formDestroyed({path: "slice.form", value: initialState}));
  });
});
