import { CheckboxControlValueAccessor, ControlValueAccessor, DefaultValueAccessor, NgControl, SelectControlValueAccessor, SelectMultipleControlValueAccessor } from "@angular/forms";
import { selectValueAccessor } from "../lib/shared/accessors";

describe('DefaultValueAccessor', () => {
  let defaultAccessor: DefaultValueAccessor;

  beforeEach(() => {
    defaultAccessor = new DefaultValueAccessor(null!, null!, null!);
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
});
