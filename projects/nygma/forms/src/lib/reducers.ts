import { Action, AsyncReducer, featureSelector } from '@actioncrew/actionstack';
import { Observable, map } from 'rxjs';
import { FormActionsInternal, actionMapping, actionQueues, deferred } from './actions';
import { Queue } from './queue';
import { deepClone, getValue, setValue } from './utils';

export type FormState = any;

export const feature = featureSelector('@global');
export const selectFormState = (path: string, nocheck?: boolean) => (state: Observable<any>) => {
  return state.pipe(map((state) => {
    const form = deepClone(getValue(state, path));
    if(!form?.__form) { !nocheck && console.warn(`You are trying to read form state from the store by path '${path}', but it is not marked as such. Is the sync directive at this point in time initialized? Consider putting your code in a ngAfterViewInit hook`); }
    else { delete form?.__form; }
    return form;
  }));
};

export const forms = (initialState: any = {}) => async (reducer: AsyncReducer) => {

  const metaReducer = async (state: any, action: any) => {
    state = state ?? deepClone(initialState);

    let nextState = state;
    const slice = action?.payload?.path;

    if(slice && actionMapping.has(action.type)) {
      const formAction = action;
      const queue = actionQueues.get(slice) ?? actionQueues.set(slice, new Queue()).get(slice);

      if(queue?.initialized$.value || formAction.type === FormActionsInternal.AutoInit) {
        const form = getValue(state, slice);
        nextState = setValue(state, slice, formAction.payload.execute(form));

        if(queue) {
          if(formAction.type === FormActionsInternal.AutoInit) {
            queue.initialized$.next(true);
            queue.initialized$.complete();
          } else if(formAction.type === FormActionsInternal.FormDestroyed) {
            actionQueues.delete(slice);
          }
        }
      }

      if (queue?.initialized$.value) {

        while(queue.length > 0) {
          const form = getValue(nextState, slice);
          const deferred = queue.dequeue() as Action<any>;
          nextState = setValue(nextState, slice, deferred.payload?.execute(form));
        }
      } else if(queue) {
        queue.enqueue(deferred(formAction));
      }

      return nextState;
    }

    nextState = await reducer(state, action);
    return nextState;
  }
  return metaReducer;
}
