import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AsyncValidator, FormArray, FormControl, FormsModule, NgForm, NgModel, ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";
import { FormGroupMixin } from '../lib/ng-model-array/mixin';
import { NgModelArray } from "../lib/ng-model-array/ngmodelarray";
import { NgFormsModule, NgModelArrayModule } from "../public-api";

class AsyncValidatorDirective implements AsyncValidator {
  constructor(private expected: string, private error: any) {}

  validate(c: any): Observable<ValidationErrors> {
    return new Observable((obs: any) => {
      const error = this.expected !== c.value ? this.error : null;
      obs.next(error);
      obs.complete();
    });
  }
}
@Component({
  selector: 'test-component',
  template: ``
})
export class TestComponent {
  @ViewChild('form', {read: NgForm}) ngForm!: NgForm;
  model = {
    aliases: ['Johny', 'Johnny']
  };
}

describe('core', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: NgModelArray;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule, NgFormsModule, NgModelArrayModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });

    fixture = TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <form #form="ngForm">
          <div ngModelArray="aliases">
            <div *ngFor="let alias of model.aliases; let i=index;">
              <input type="text" [(ngModel)]="model.aliases[i]" name="{{i}}">
            </div>
          </div>
        </form>`
      }
    }).createComponent(TestComponent);

    directive = fixture.debugElement.children[0].children[0].injector.get(NgModelArray);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
  it('should create directive for two elements', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(directive.form.controls.length).toBe(2);
    expect(directive.form.value).toEqual(['Johny', 'Johnny']);
  });
  it('should return a form array', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(directive.control instanceof FormArray).toBe(true);
    expect(directive.control.length).toEqual(2);
  });
  it('should throw an exception when path or name of the control is null', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    const parent = directive._parent;
    const name = directive.name;

    expect(() => directive.path).not.toThrow();

    directive._parent = { get path(): any {return null;} } as any;
    expect(() => directive.path).toThrowError();
    directive._parent = parent;

    Object.assign(directive, {name: null});
    expect(() => directive.path).toThrowError();

    directive._parent = { get path(): any {return null;} } as any;
    Object.assign(directive, {name: null});
    expect(() => directive.path).toThrowError();

    directive.name = name;
    directive._parent = parent;
  });
  it('should return root ngForm directive', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(directive.ngForm instanceof NgForm).toBe(true);
    expect(directive.ngForm).toBe(fixture.componentRef.instance.ngForm);
  });
  it('should add and remove NgModel controls', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    const control = new NgModel(directive, null as any, null as any, null as any, null as any);
    control.name = '2';

    directive.addControl(control);
    expect(directive.control.length).toEqual(3);
    expect(directive.ngForm.form.get(control.path)).toBe(control.control);
    expect(directive.control.controls.includes(control.control)).toBe(true);

    directive.removeControl(control);
    expect(directive.control.length).toEqual(2);
    expect(directive.control.controls.includes(control.control)).toBe(false);

    expect(directive.ngForm).toBe(fixture.componentRef.instance.ngForm);
  });
  it('should normalize validators', async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    const array = directive.normalizeValidators([AsyncValidatorDirective, () => {return null;}]);
    expect(array.length).toBe(2);
  })
  it("should extend FormGroupMixin", async() => {
    fixture.detectChanges();
    await fixture.whenStable();

    FormGroupMixin(directive.form).registerControl('2', new FormControl('test'));
    FormGroupMixin(directive.form).registerOnChange((_: any) => {});
    FormGroupMixin(directive.form).registerOnDisabledChange((_: any) => {});
    expect(FormGroupMixin(directive.form).contains('2')).toBe(true);
    FormGroupMixin(directive.form).removeControl('2');
    expect(FormGroupMixin(directive.form).contains('2')).toBe(false);

    FormGroupMixin(directive.form).addControl('2', new FormControl('test'));
    expect(FormGroupMixin(directive.form).contains('2')).toBe(true);
    FormGroupMixin(directive.form).removeControl('2');
    expect(FormGroupMixin(directive.form).contains('2')).toBe(false);
  });
});
