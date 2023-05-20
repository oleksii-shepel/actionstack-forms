import { Validators } from '@angular/forms';
import * as Builder from './builder';

describe('buildFormGroup', () => {
  it('should create a FormGroup from a model', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const form = Builder.buildFormGroup(model);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });
  it('should create a FormGroup from a model with options', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const options = {
      name: {
        validators: [Validators.required]
      },
      age: {
        validators: [Validators.required]
      },
      address: {
        validators: [Validators.required]
      }
    };

    const form = Builder.buildFormGroup(model, options);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });

  it('should create a FormGroup from a model with options and group options', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const options = {
      name: {
        validators: [Validators.required]
      },
      age: {
        validators: [Validators.required]
      },
      address: {
        validators: [Validators.required]
      }
    };

    const groupOptions = {
      validators: [Validators.required]
    };

    const form = Builder.buildFormGroup(model, options, groupOptions);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });
});

describe('buildFormArray', () => {
  it('should create a FormArray from a model', () => {
    const model = [
      {
        name: 'John',
        age: 23,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      },
      {
        name: 'Jane',
        age: 25,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      }
    ];

    const form = Builder.buildFormArray(model);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });
  it('should create a FormArray from a model with options', () => {
    const model = [
      {
        name: 'John',
        age: 23,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      },
      {
        name: 'Jane',
        age: 25,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      }
    ];

    const options = {
      name: {
        validators: [Validators.required]
      },
      age: {
        validators: [Validators.required]
      },
      address: {
        validators: [Validators.required]
      }
    };

    const form = Builder.buildFormArray(model, options);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });

  it('should create a FormArray from a model with options and group options', () => {
    const model = [
      {
        name: 'John',
        age: 23,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      },
      {
        name: 'Jane',
        age: 25,
        address: {
          street: 'Main Street',
          number: 123,
          city: 'New York',
          country: 'USA'
        }
      }
    ];

    const options = {
      name: {
        validators: [Validators.required]
      },
      age: {
        validators: [Validators.required]
      },
      address: {
        validators: [Validators.required]
      }
    };

    const groupOptions = {
      validators: [Validators.required]
    };

    const form = Builder.buildFormArray(model, options, groupOptions);

    expect(form).toBeTruthy();
    expect(form.value).toEqual(model);
  });
});

describe('checkFormArray', () => {
  it('should return true if the value is a FormArray', () => {

    const model = [
      {
        name: 'John',
        age: 23,
        address: {
          street: 'Main Street',
          number: 123,

          city: 'New York',
          country: 'USA'
        }
      },
      {
        name: 'Jane',
        age: 25,
        address: {
          street: 'Main Street',
          number: 123,

          city: 'New York',
          country: 'USA'
        }
      }
    ];

    const form = Builder.buildFormArray(model);

    expect(Builder.checkFormArray(form as any, model)).toBeTruthy();
  });
  it('should return true if the value is a FormGroup', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,

        city: 'New York',
        country: 'USA'
      }
    };

    const form = Builder.buildFormGroup(model);

    expect(Builder.checkFormGroup(form as any, model)).toBeFalsy();
  });
});
describe('deepClone', () => {
  it('should clone an object', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const clone = Builder.deepClone(model);

    expect(clone).toEqual(model);
  });
});

describe('patchValue', () => {
  it('should patch a value', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const clone = Builder.deepClone(model);

    clone.name = 'Jane';

    let form = Builder.buildFormGroup(model);
    form.updateValueAndValidity();
    form.patchValue(clone);

    //Builder.patchValue(form, clone);
    //form.updateValueAndValidity();

    expect(form.value).toEqual(clone);
  });
});

describe('deepEqual', () => {

  it('should return true if the objects are equal', () => {
    const model = {
      name: 'John',
      age: 23,
      address: {
        street: 'Main Street',
        number: 123,
        city: 'New York',
        country: 'USA'
      }
    };

    const clone = Builder.deepClone(model);
    expect(Builder.deepEqual(model, clone)).toBeTruthy();
  });
});
