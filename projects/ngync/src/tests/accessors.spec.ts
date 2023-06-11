import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Renderer2 } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxControlValueAccessor, ControlValueAccessor, DefaultValueAccessor, FormsModule, NgControl, ReactiveFormsModule, SelectControlValueAccessor, SelectMultipleControlValueAccessor } from "@angular/forms";
import { BuiltInControlValueAccessor, isBuiltInAccessor, selectValueAccessor } from "../lib/shared/accessors";

class ValueAccessor extends BuiltInControlValueAccessor implements ControlValueAccessor {
  constructor() {
    super(null!, null!);
  }
  writeValue(obj: any): void {
    throw new Error("Method not implemented.");
  }
}

@Component({
  selector: 'test-component',
  template: ``
})
export class TestComponent {
}

describe('value acccessor', () => {
  let defaultAccessor: DefaultValueAccessor;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {

    fixture = TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, FormsModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).createComponent(TestComponent);

    defaultAccessor = new DefaultValueAccessor(fixture.componentRef.injector.get(Renderer2), fixture.elementRef, false);
  });

  it('should call onChange with the new value', () => {
    const spy = jest.fn();
    defaultAccessor.registerOnChange(spy);
    defaultAccessor.onChange('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('should call onTouched when the control is blurred', () => {
    const spy = jest.fn();
    defaultAccessor.registerOnTouched(spy);
    defaultAccessor.onTouched();
    expect(spy).toHaveBeenCalled();
  });

  describe('shared', () => {
    describe('selectValueAccessor', () => {
      let dir: NgControl;

      beforeEach(() => {
        dir = {path: []} as any;
      });

      it('should throw when given an empty array', () => {
        expect(() => selectValueAccessor(dir, [])).toThrowError();
      });

      it('should throw when accessor is not provided as array', () => {
        expect(() => selectValueAccessor(dir, {} as any[]))
            .toThrowError();
      });

      it('should return the default value accessor when no other provided', () => {
        expect(selectValueAccessor(dir, [defaultAccessor])).toEqual(defaultAccessor);
      });

      it('should return checkbox accessor when provided', () => {
        const checkboxAccessor = new CheckboxControlValueAccessor(null!, null!);
        expect(selectValueAccessor(dir, [
          defaultAccessor, checkboxAccessor
        ])).toEqual(checkboxAccessor);
      });

      it('should return select accessor when provided', () => {
        const selectAccessor = new SelectControlValueAccessor(null!, null!);
        expect(selectValueAccessor(dir, [
          defaultAccessor, selectAccessor
        ])).toEqual(selectAccessor);
      });

      it('should return select multiple accessor when provided', () => {
        const selectMultipleAccessor = new SelectMultipleControlValueAccessor(null!, null!);
        expect(selectValueAccessor(dir, [
          defaultAccessor, selectMultipleAccessor
        ])).toEqual(selectMultipleAccessor);
      });

      it('should throw when more than one build-in accessor is provided', () => {
        const checkboxAccessor = new CheckboxControlValueAccessor(null!, null!);
        const selectAccessor = new SelectControlValueAccessor(null!, null!);
        expect(() => selectValueAccessor(dir, [checkboxAccessor, selectAccessor])).toThrowError();
      });

      it('should return custom accessor when provided', () => {
        const customAccessor: ControlValueAccessor = {} as any;
        expect(selectValueAccessor(dir, <any>[
          defaultAccessor, customAccessor
        ])).toEqual(customAccessor);
      });

      it('should throw when more than one custom accessor is provided', () => {
        const customAccessor: ControlValueAccessor = {} as any;
        expect(() => selectValueAccessor(dir, [customAccessor, customAccessor])).toThrowError();
      });
    });
  });
  describe('isBuiltInAccessor', () => {
    it('should return true when the value accessor is a built-in', () => {
      const valueAccessor = new ValueAccessor();
      expect(isBuiltInAccessor(valueAccessor)).toBe(true);
    });

    it('should return false when the value accessor is not a built-in', () => {
      const customAccessor: ControlValueAccessor = {} as any;
      expect(isBuiltInAccessor(customAccessor)).toBe(false);
    });
  });
});
