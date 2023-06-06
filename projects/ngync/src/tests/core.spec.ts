import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { NGYNC_CONFIG_DEFAULT, SharedModule } from "../lib/shared/module";
import { InitForm, SyncDirective, forms, logger } from "../public-api";

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
        metaReducers: [forms({'slice': {}}), logger()]
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
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
  it('should create directive', async() => {
    await fixture.whenStable();

    expect(directive.slice).toBe('slice');
    expect(directive.dir instanceof FormGroupDirective).toBeTruthy();
    expect(directive.debounce).toBe(NGYNC_CONFIG_DEFAULT.debounce);
    expect(directive.resetOnDestroy).toBe(NGYNC_CONFIG_DEFAULT.resetOnDestroy);
    expect(directive.updateOn).toBe(NGYNC_CONFIG_DEFAULT.updateOn);
    expect(directive.autoSubmit).toBe(NGYNC_CONFIG_DEFAULT.autoSubmit);
  });

  it('should dispatch AutoInit action', async() => {
    let stub = jest.fn();

    directive.cdr.detectChanges();
    directive.onAutoInit$.subscribe(stub);

    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 1000));

    expect(stub).toHaveBeenCalled();
    directive.cdr.detectChanges();
    expect(directive.dir.form.value).toEqual({ firstName: 'John' });
  });

  it('should call observable when InitForm action dispatched', async() => {
    let stub = jest.fn();

    directive.cdr.detectChanges();

    directive.onInitOrUpdate$.subscribe(stub);
    directive.store.dispatch(InitForm({path:'slice', value: { firstName: 'Jane' }}));

    await fixture.whenStable();

    await new Promise((r) => setTimeout(r, 1000));

    expect(stub).toHaveBeenCalled();
    expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
  });
});
