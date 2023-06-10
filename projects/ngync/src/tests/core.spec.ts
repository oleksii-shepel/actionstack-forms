import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { NGYNC_CONFIG_DEFAULT, SharedModule } from "../lib/shared/module";
import { InitForm, SyncDirective, UpdateSubmitted, UpdateValue, forms } from "../public-api";

@Component({
  selector: 'test-component',
  template: ``
})
export class TestComponent {
  form = new FormGroup({
    firstName: new FormControl('John')
  });
}

describe('core', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: SyncDirective;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
        metaReducers: [forms({'slice': {}})]
      }), SharedModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });

    fixture = TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <form [formGroup]="form" ngync="slice">
          <input type="text" formControlName="firstName"/>
          <button type="submit">Submit</button>
        </form>`
      }
    }).createComponent(TestComponent);

    directive = fixture.debugElement.children[0].injector.get(SyncDirective);
    directive.slice = 'slice';

    jest.useFakeTimers();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllTimers();
  });
  it('should create directive', async() => {
    expect(directive.slice).toBe('slice');
    expect(directive.dir instanceof FormGroupDirective).toBeTruthy();
    expect(directive.debounce).toBe(NGYNC_CONFIG_DEFAULT.debounce);
    expect(directive.resetOnDestroy).toBe(NGYNC_CONFIG_DEFAULT.resetOnDestroy);
    expect(directive.updateOn).toBe(NGYNC_CONFIG_DEFAULT.updateOn);
    expect(directive.autoSubmit).toBe(NGYNC_CONFIG_DEFAULT.autoSubmit);
  });

  it('should dispatch AutoInit action', async() => {
    let stub = jest.fn();

    directive.onAutoInit$.subscribe(stub);
    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();
    expect(directive.dir.form.value).toEqual({ firstName: 'John' });
  });

  it('should dispatch AutoSubmit action', async() => {
    let stub = jest.fn();

    directive.onAutoInit$.subscribe(stub);
    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();

    directive.onAutoSubmit$.subscribe(stub);

    let button = fixture.debugElement.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await fixture.whenStable();
    expect(stub).toHaveBeenCalled();
  });

  it('should call subscription when InitForm action dispatched', async() => {
    let stub = jest.fn();

    directive.onInitOrUpdate$.subscribe(stub);
    directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));

    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();
    expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
  });

  it('should call subscription when UpdateValue action dispatched', async() => {
    let stub = jest.fn();

    directive.onAutoInit$.subscribe(stub);
    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();

    directive.onInitOrUpdate$.subscribe(stub);
    directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));

    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();
    expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
  });

  it('should call subscription when UpdateSubmitted action dispatched', async() => {
    let stub = jest.fn();

    directive.onAutoInit$.subscribe(stub);
    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();

    directive.onSubmit$.subscribe(stub);
    directive.store.dispatch(UpdateSubmitted({ path:'slice', value: true }));

    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();
  });

  it('should call subscription when changes in control group happens', async() => {
    let stub = jest.fn();

    directive.onControlsChanges$.subscribe(stub);
    directive.dir.form.addControl('lastName', new FormControl('Doe'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(stub).toHaveBeenCalled();
  });
});
