import { firstValueFrom, lastValueFrom } from 'rxjs';
import { DomObserver } from '../lib/shared/dom';

describe('dom', () => {
  it('should observe unmount', () => {
    let element = document.createElement('div');
    document.body.appendChild(element);
    let event$ = new DomObserver().unmounted(element);

    element.remove();
    expect(firstValueFrom(event$)).resolves.toBeTruthy();
  });
  it ('should observe children', (done) => {
    let element = document.createElement('div');
    document.body.appendChild(element);
    let event$ = new DomObserver().children(element);

    let children = 0;
    let times = 0;

    event$.subscribe(value => {
      children += value;
      times++;
      if(times === 5) {
        expect(children).toEqual(1);
        done();
      }
    });

    element.appendChild(document.createElement('div'));
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createElement('div'));
    element.removeChild(element.firstChild!);
    element.removeChild(element.firstChild!);

    expect(lastValueFrom(event$)).resolves.toBeCalledTimes(5);
  });
  it ('should observe mounted', () => {
    let element = document.createElement('div');
    let mounted = DomObserver.mounted(element);

    expect(mounted).toEqual(false);

    document.body.appendChild(element);
    mounted = DomObserver.mounted(element);
    expect(mounted).toEqual(true);

    document.body.removeChild(element);
    mounted = DomObserver.mounted(element);
    expect(mounted).toEqual(false);
  });
  it ('should disconnect', () => {
    let element = document.createElement('div');
    document.body.appendChild(element);
    let domobserver = new DomObserver();
    let unmounted$ = domobserver.unmounted(element);

    let observer = domobserver._observers.values().next().value;
    expect(observer).toBeTruthy();

    domobserver.disconnect(observer!);
    expect(domobserver._observers.has(observer)).toBeFalsy();

    let children$ = domobserver.children(element);

    observer = domobserver._observers.values().next().value;
    expect(observer).toBeTruthy();

    domobserver.disconnect(observer!);
    expect(domobserver._observers.has(observer)).toBeFalsy();
  });
});
