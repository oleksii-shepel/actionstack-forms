import { InjectionToken } from "@angular/core";

/**
 * Token to provide to allow SetDisabledState to always be called when a CVA is added, regardless of
 * whether the control is disabled or enabled.
 *
 * @see `FormsModule.withConfig`
 */
export const CALL_SET_DISABLED_STATE = new InjectionToken(
  'CallSetDisabledState',
  { providedIn: 'root', factory: () => setDisabledStateDefault }
);

/**
 * The type for CALL_SET_DISABLED_STATE. If `always`, then ControlValueAccessor will always call
 * `setDisabledState` when attached, which is the most correct behavior. Otherwise, it will only be
 * called when disabled, which is the legacy behavior for compatibility.
 *
 * @publicApi
 * @see `FormsModule.withConfig`
 */
export type SetDisabledStateOption = 'whenDisabledForLegacyCode' | 'always';

/**
 * Whether to use the fixed setDisabledState behavior by default.
 */
export const setDisabledStateDefault: SetDisabledStateOption = 'always';
