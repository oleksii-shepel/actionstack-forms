import { Directive, ElementRef, Renderer2 } from "@angular/core";
import { AbstractControlDirective, ControlValueAccessor, DefaultValueAccessor } from "@angular/forms";

/**
 * Base class for all ControlValueAccessor classes defined in Forms package.
 * Contains common logic and utility functions.
 *
 * Note: this is an *internal-only* class and should not be extended or used directly in
 * applications code.
 */
@Directive()
export class BaseControlValueAccessor {
  /**
   * The registered callback function called when a change or input event occurs on the input
   * element.
   * @nodoc
   */
  onChange = (_: any) => {};

  /**
   * The registered callback function called when a blur event occurs on the input element.
   * @nodoc
   */
  onTouched = () => {};

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  /**
   * Helper method that sets a property on a target element using the current Renderer
   * implementation.
   * @nodoc
   */
  protected setProperty(key: string, value: any): void {
    this._renderer.setProperty(this._elementRef.nativeElement, key, value);
  }

  /**
   * Registers a function called when the control is touched.
   * @nodoc
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  /**
   * Sets the "disabled" property on the range input element.
   * @nodoc
   */
  setDisabledState(isDisabled: boolean): void {
    this.setProperty('disabled', isDisabled);
  }
}

/**
 * Base class for all built-in ControlValueAccessor classes (except DefaultValueAccessor, which is
 * used in case no other CVAs can be found). We use this class to distinguish between default CVA,
 * built-in CVAs and custom CVAs, so that Forms logic can recognize built-in CVAs and treat custom
 * ones with higher priority (when both built-in and custom CVAs are present).
 *
 * Note: this is an *internal-only* class and should not be extended or used directly in
 * applications code.
 */
@Directive()
export class BuiltInControlValueAccessor extends BaseControlValueAccessor {
}

// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
export function selectValueAccessor(
  dir: AbstractControlDirective,
  valueAccessors: ControlValueAccessor[]
): ControlValueAccessor | null {
  if (!valueAccessors) return null;

  if (!Array.isArray(valueAccessors)) {
    _throwError(
      dir,
      `Value accessor was not provided as an array for form control with.` +
        `Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`
    );
  }

  let defaultAccessor: ControlValueAccessor | undefined = undefined;
  let builtinAccessor: ControlValueAccessor | undefined = undefined;
  let customAccessor: ControlValueAccessor | undefined = undefined;

  valueAccessors.forEach((v: ControlValueAccessor) => {
    if (v.constructor === DefaultValueAccessor) {
      defaultAccessor = v;
    } else if (isBuiltInAccessor(v)) {
      if (builtinAccessor) {
        _throwError(
          dir,
          'More than one built-in value accessor matches form control with'
        );
      }
      builtinAccessor = v;
    } else {
      if (customAccessor)
        _throwError(
          dir,
          'More than one custom value accessor matches form control with'
        );
      customAccessor = v;
    }
  });

  if (customAccessor) return customAccessor;
  if (builtinAccessor) return builtinAccessor;
  if (defaultAccessor) return defaultAccessor;

  _throwError(dir, 'No valid value accessor for form control with');
  return null;
}

function _describeControlLocation(dir: AbstractControlDirective): string {
  const path = dir.path;
  if (path && path.length > 1) return `path: '${path.join(' -> ')}'`;
  if (path?.[0]) return `name: '${path}'`;
  return 'unspecified name attribute';
}

function _throwError(dir: AbstractControlDirective, message: string): void {
  const messageEnd = _describeControlLocation(dir);
  throw new Error(`${message} ${messageEnd}`);
}

export function isBuiltInAccessor(
  valueAccessor: ControlValueAccessor
): boolean {
  // Check if a given value accessor is an instance of a class that directly extends
  // `BuiltInControlValueAccessor` one.
  return (
    Object.getPrototypeOf(valueAccessor.constructor) ===
    BuiltInControlValueAccessor
  );
}
