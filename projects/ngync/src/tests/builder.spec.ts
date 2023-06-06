import { Validators } from '@angular/forms';
import { buildForm, checkForm } from '../lib/shared/builder';
import { ModelOptions } from '../lib/shared/types';

describe('builder', () => {
  it('should build form', () => {
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

    let modelOptions: ModelOptions<typeof model> = {
      __group: {},
      firstName: {validators: Validators.required},
      lastName: {validators: Validators.required},
      email: {validators: Validators.email},
      address: {
        __group: {},
        street: {validators: Validators.required},
        city: {validators: Validators.required},
        state: {validators: Validators.required},
        zip: {validators: Validators.required},
      },
      aliases: {
        __group: {},
        '0': {validators: Validators.required},
        '1': {validators: Validators.required},
      },
    };

    let form = buildForm(model, modelOptions);

    expect(form.value).toEqual(model);
    expect(checkForm(form, model)).toEqual(true);
  });
  it('should build form array', () => {
    let model = [{
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
    }, {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@contoso.com',
      address: {
        street: '123 Main St.',
        city: 'Anytown',
        state: 'CA',
        zip: '',
      },
      aliases: ['Janey', 'Janie'],
    }];

    let modelOptions: ModelOptions<typeof model> = {
      __group: {},
      '0': {
        __group: {},
        firstName: {validators: Validators.required},
        lastName: {validators: Validators.required},
        email: {validators: Validators.email},
        address: {
          __group: {},
          street: {validators: Validators.required},
          city: {validators: Validators.required},
          state: {validators: Validators.required},
          zip: {validators: Validators.required},
        },
        aliases: {
          __group: {},
          '0': {validators: Validators.required},
          '1': {validators: Validators.required},
        },
      },
      '1': {
        __group: {},
        firstName: {validators: Validators.required},
        lastName: {validators: Validators.required},
        email: {validators: Validators.email},
        address: {
          __group: {},
          street: {validators: Validators.required},
          city: {validators: Validators.required},
          state: {validators: Validators.required},
          zip: {validators: Validators.required},
        },
        aliases: {
          __group: {},
          '0': {validators: Validators.required},
          '1': {validators: Validators.required},
        },
      }
    };

    let form = buildForm(model, modelOptions);

    expect(form.value).toEqual(model);
    expect(checkForm(form, model)).toEqual(true);
  });
});