import { Validators } from '@angular/forms';
import { buildForm, checkForm } from '../lib/shared/builder';

describe('builder', () => {
  it('should build form', () => {
    let model = { a: 1, b: 2, c: 3 };
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form array', () => {
    let model = [1, 2, 3];
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form group', () => {
    let model = { a: { b: { c: 1 } } };
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form array group', () => {
    let model = { a: { b: [{ c: 1 }] } };
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form group array', () => {
    let model = { a: [{ b: { c: 1 } }] };
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form array array', () => {
    let model = [{ b: { c: 1 } }];
    let form = buildForm(model);

    expect(form.value).toEqual(model);
  });
  it('should build form with options', () => {
    let model = { a: 1, b: 2, c: 3 };
    let form = buildForm(model, {__group: {}, a: {validators: Validators.required}, b: {validators: Validators.email}, c: {validators: Validators.maxLength(10)} });

    expect(form.value).toEqual(model);
  });
  it('should build form array with options', () => {
    let model = [1, 2, 3];
    let form = buildForm(model, { __group: {}, '0': {validators: Validators.required}, '1': {validators: Validators.email}, '2': {validators: Validators.maxLength(10)} });

    expect(form.value).toEqual(model);
  });
  it('should check form', () => {
    let model = { a: 1, b: 2, c: 3 };
    let form = buildForm(model);

    expect(checkForm(form, model)).toEqual(true);
  });
});
