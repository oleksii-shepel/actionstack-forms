import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { firstValueFrom } from 'rxjs';
import { NGYNC_CONFIG_DEFAULT, SharedModule } from "../lib/shared/module";
import { AutoInit, AutoSubmit, InitForm, SyncDirective, UpdateSubmitted, UpdateValue, forms, getModel, getSubmitted } from "../public-api";

describe('core', () => {
  describe('FormGroupDirective', () => {
    @Component({
      selector: 'test-component',
      template: ``
    })
    class TestComponent {
      form = new FormGroup({
        firstName: new FormControl('John')
      });
    }

    let fixture: ComponentFixture<TestComponent>;
    let directive: SyncDirective;
    let subs = {} as any;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
          metaReducers: [forms({'slice': {}})]
        }), SharedModule]
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

      for (let sub in subs) {
        subs[sub]?.unsubscribe();
      }
      subs = {};
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

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'John' });
    });

    it('should dispatch AutoSubmit action', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onAutoSubmit$.subscribe(stub);

      let button = fixture.debugElement.nativeElement.querySelector('button') as HTMLButtonElement;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });

    it('should call subscription when InitForm action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onInitOrUpdate$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      subs.b = directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
    });

    it('should call subscription when UpdateValue action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onInitOrUpdate$.subscribe(stub);
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
    });

    it('should call subscription when UpdateSubmitted action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onSubmit$.subscribe(stub);
      directive.store.dispatch(UpdateSubmitted({ path:'slice', value: true }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });

    xit('should call subscription when changes in control group happens', async() => {
      let stub = jest.fn();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      subs.a = directive.onControlsChanges$.subscribe(stub);
      directive.dir.form.addControl('lastName', new FormControl('Doe'));

      fixture.detectChanges();
      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });
    it('should not call subscriptions when component removed from the DOM', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      fixture.detectChanges();
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);
      subs.b = directive.onAutoSubmit$.subscribe(stub);
      subs.c = directive.onInitOrUpdate$.subscribe(stub);
      subs.d = directive.onSubmit$.subscribe(stub);
      subs.e = directive.onChange$.subscribe(stub);
      subs.f = directive.onControlsChanges$.subscribe(stub);

      document.body.removeChild(fixture.debugElement.nativeElement);

      directive.store.dispatch(AutoInit({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(AutoSubmit({ path:'slice' }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateSubmitted({ path:'slice', value: true }));

      directive._input$.next(true);
      directive._blur$.next(true);
      directive._submitted$.next(true);

      fixture.detectChanges();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).not.toHaveBeenCalled();
    });

    it('dispatch InitForm before AutoInit action triggered', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).not.toHaveBeenCalled();
    });
    it('onInitOrUpdate', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      let stub = jest.fn();

      subs.b = directive.onInitOrUpdate$.subscribe(stub);

      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Helen' } }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'John' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
      expect(stub).toHaveBeenCalledTimes(3);

      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Helen' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'John' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
      expect(stub).toHaveBeenCalledTimes(6);
    });
    describe('onChanges', () => {
      it('change', async () => {
        let auto = jest.fn();

        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);
      });
      it('blur', async () => {
        directive.updateOn = 'blur';

        let auto = jest.fn();
        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);
      });
      it('submitted', async () => {
        directive.updateOn = 'submitted';

        let auto = jest.fn();
        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);

      });
    });
    it('ngOnDestroy', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      directive.dir.form.setValue({ firstName: 'Helen' });
      directive.dir.form.markAsDirty();

      directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      directive.resetOnDestroy = 'no-changes';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'Helen'});

      directive.resetOnDestroy = 'initial';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'John'});

      directive.resetOnDestroy = 'submitted';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'Helen'});

      directive.resetOnDestroy = 'empty';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({});
    });
    it('formStatus and formValue', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      directive.dir.form.setValue({ firstName: 'Jane' });
      directive.dir.form.markAsDirty();
      directive._input$.next(true);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
      expect(directive.dir.form.dirty).toBe(true);

      await expect(directive.formStatus).toEqual("VALID");
      await expect(directive.formValue).toEqual({ firstName: 'Jane' });
    });
  });
  describe('NgForm', () => {
    @Component({
      selector: 'test-component',
      template: ``
    })
    class TestComponent {
      firstName = 'John';
    }

    let fixture: ComponentFixture<TestComponent>;
    let directive: SyncDirective;
    let subs = {} as any;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
          metaReducers: [forms({'slice': {}})]
        }), SharedModule]
      });

      fixture = TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <form #form="ngForm" ngync="slice">
            <input type="text" [(ngModel)]="firstName" name="firstName"/>
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
      jest.useRealTimers();
      jest.clearAllTimers();

      for (let sub in subs) {
        subs[sub]?.unsubscribe();
      }
      subs = {};
    });
    it('should create directive', async() => {
      expect(directive.slice).toBe('slice');
      expect(directive.dir instanceof NgForm).toBeTruthy();
      expect(directive.debounce).toBe(NGYNC_CONFIG_DEFAULT.debounce);
      expect(directive.resetOnDestroy).toBe(NGYNC_CONFIG_DEFAULT.resetOnDestroy);
      expect(directive.updateOn).toBe(NGYNC_CONFIG_DEFAULT.updateOn);
      expect(directive.autoSubmit).toBe(NGYNC_CONFIG_DEFAULT.autoSubmit);
    });

    it('should dispatch AutoInit action', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'John' });
    });

    it('should dispatch AutoSubmit action', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onAutoSubmit$.subscribe(stub);

      let button = fixture.debugElement.nativeElement.querySelector('button') as HTMLButtonElement;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });

    it('should call subscription when InitForm action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onInitOrUpdate$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
    });

    it('should call subscription when UpdateValue action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onInitOrUpdate$.subscribe(stub);
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
    });

    it('should call subscription when UpdateSubmitted action dispatched', async() => {
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();

      subs.b = directive.onSubmit$.subscribe(stub);
      directive.store.dispatch(UpdateSubmitted({ path:'slice', value: true }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });

    xit('should call subscription when changes in control group happens', async() => {
      let stub = jest.fn();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      subs.a = directive.onControlsChanges$.subscribe(stub);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      directive.dir.form.addControl('lastName', new FormControl('Doe'));

      fixture.detectChanges();
      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).toHaveBeenCalled();
    });

    it('should not call subscriptions when component removed from the DOM', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      fixture.detectChanges();
      let stub = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(stub);
      subs.b = directive.onAutoSubmit$.subscribe(stub);
      subs.c = directive.onInitOrUpdate$.subscribe(stub);
      subs.d = directive.onSubmit$.subscribe(stub);
      subs.e = directive.onChange$.subscribe(stub);
      subs.f = directive.onControlsChanges$.subscribe(stub);

      document.body.removeChild(fixture.debugElement.nativeElement);

      directive.store.dispatch(AutoInit({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(AutoSubmit({ path:'slice' }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateSubmitted({ path:'slice', value: true }));

      directive._input$.next(true);
      directive._blur$.next(true);
      directive._submitted$.next(true);

      fixture.detectChanges();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(stub).not.toHaveBeenCalled();
    });

    it('dispatch InitForm before AutoInit action triggered', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).not.toHaveBeenCalled();
    });
    it('onInitOrUpdate', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      let stub = jest.fn();

      subs.b = directive.onInitOrUpdate$.subscribe(stub);

      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'Helen' } }));
      directive.store.dispatch(InitForm({ path:'slice', value: { firstName: 'John' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
      expect(stub).toHaveBeenCalledTimes(3);

      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Jane' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'Helen' } }));
      directive.store.dispatch(UpdateValue({ path:'slice', value: { firstName: 'John' } }));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
      expect(stub).toHaveBeenCalledTimes(6);
    });
    describe('onChanges', () => {
      it('change', async () => {
        let auto = jest.fn();

        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);
      });
      it('blur', async () => {
        directive.updateOn = 'blur';

        let auto = jest.fn();
        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);
      });
      it('submitted', async () => {
        directive.updateOn = 'submitted';

        let auto = jest.fn();
        subs.a = directive.onAutoInit$.subscribe(auto);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        expect(auto).toHaveBeenCalled();

        directive.dir.form.setValue({ firstName: 'Jane' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });

        directive.dir.form.setValue({ firstName: 'Helen' });
        directive.dir.form.markAsDirty();
        directive._input$.next(true);
        directive._blur$.next(true);

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'John' });
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(true);

        directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

        jest.advanceTimersByTime(3000);
        await fixture.whenStable();

        await expect(firstValueFrom(directive.store.select(getSubmitted('slice')))).resolves.toBe(true);
        expect(directive.dir.form.value).toEqual({ firstName: 'Helen' });
        expect(directive.dir.form.dirty).toBe(false);

      });
    });
    it('ngOnDestroy', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      directive.dir.form.setValue({ firstName: 'Helen' });
      directive.dir.form.markAsDirty();

      directive.store.dispatch(UpdateSubmitted({path :'slice', value: true}));

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      directive.resetOnDestroy = 'no-changes';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'Helen'});

      directive.resetOnDestroy = 'initial';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'John'});

      directive.resetOnDestroy = 'submitted';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({firstName: 'Helen'});

      directive.resetOnDestroy = 'empty';
      directive.ngOnDestroy();

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({});
    });
    it('formStatus and formValue', async () => {
      let auto = jest.fn();

      subs.a = directive.onAutoInit$.subscribe(auto);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      expect(auto).toHaveBeenCalled();

      directive.dir.form.setValue({ firstName: 'Jane' });
      directive.dir.form.markAsDirty();
      directive._input$.next(true);

      jest.advanceTimersByTime(3000);
      await fixture.whenStable();

      await expect(firstValueFrom(directive.store.select(getModel('slice')))).resolves.toEqual({ firstName: 'Jane' });
      expect(directive.dir.form.value).toEqual({ firstName: 'Jane' });
      expect(directive.dir.form.dirty).toBe(true);

      await expect(directive.formStatus).toEqual("VALID");
      await expect(directive.formValue).toEqual({ firstName: 'Jane' });
    });
  });

  describe('shared', () => {
    it("should init directive with Ngync instance", (async () => {
      @Component({
        selector: 'test-component',
        template: ``
      })
      class TestComponent {
        form = new FormGroup({
          firstName: new FormControl('John')
        });
      }

      let fixture: ComponentFixture<TestComponent>;
      let directive: SyncDirective;
      let subs = {} as any;

      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
          metaReducers: [forms({'slice': {}})]
        }), SharedModule]
      });

      fixture = TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <form [formGroup]="form" [ngync]="{slice: 'model', debounce: 125, resetOnDestroy: 'initial', updateOn: 'blur', autoSubmit: false }">
            <input type="text" formControlName="firstName"/>
            <button type="submit">Submit</button>
          </form>`
        }
      }).createComponent(TestComponent);

      directive = fixture.debugElement.children[0].injector.get(SyncDirective);

      jest.useFakeTimers();
      fixture.detectChanges();
      await fixture.whenStable();

      TestBed.resetTestingModule();
      jest.clearAllTimers();

      for (let sub in subs) {
        subs[sub]?.unsubscribe();
      }
      subs = {};
    }));

    it("should throw exception if slice is not provided", (async () => {
      @Component({
        selector: 'test-component',
        template: ``
      })
      class TestComponent {
        form = new FormGroup({
          firstName: new FormControl('John')
        });
      }

      let fixture: ComponentFixture<TestComponent>;
      let directive: SyncDirective;

      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
          metaReducers: [forms({'slice': {}})]
        }), SharedModule]
      });

      fixture = TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <form [formGroup]="form" [ngync]="{}">
            <input type="text" formControlName="firstName"/>
            <button type="submit">Submit</button>
          </form>`
        }
      }).createComponent(TestComponent);

      directive = fixture.debugElement.children[0].injector.get(SyncDirective);

      expect(Promise.resolve(directive.ngOnInit())).rejects.toThrow(Error);

      TestBed.resetTestingModule();
      jest.clearAllTimers();
    }));

    it("should throw exception if form directive not found", (async () => {
      @Component({
        selector: 'test-component',
        template: ``
      })
      class TestComponent {
        form = new FormGroup({
          firstName: new FormControl('John')
        });
      }

      let fixture: ComponentFixture<TestComponent>;
      let directive: SyncDirective;

      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
          metaReducers: [forms({'slice': {}})]
        }), SharedModule]
      });

      fixture = TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <form [ngync]="model">
            <input type="text" formControlName="firstName"/>
            <button type="submit">Submit</button>
          </form>`
        }
      }).createComponent(TestComponent);

      directive = fixture.debugElement.children[0].injector.get(SyncDirective);

      expect(Promise.resolve(directive.ngOnInit())).rejects.toThrow(Error);

      TestBed.resetTestingModule();
      jest.clearAllTimers();
    }));
  });
  it("should check if all controls are initialized", (async () => {
    @Component({
      selector: 'test-component',
      template: ``
    })
    class TestComponent {
      form = new FormGroup({
        firstName: new FormControl('John')
      });
    }

    let fixture: ComponentFixture<TestComponent>;
    let directive: SyncDirective;

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule, StoreModule.forRoot((state: any, action: any): any => state, {
        metaReducers: [forms({'slice': {}})]
      }), SharedModule]
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
    jest.advanceTimersByTime(3000);
    await fixture.whenStable();

    expect(directive.initialized).toBe(true);

    TestBed.resetTestingModule();
    jest.clearAllTimers();
  }));
});

