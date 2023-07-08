import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormGroupMixin, NgModelArray, NgModelArrayModule } from "../app/utils";

@Component({
  selector: 'test-component',
  template: ``
})
export class TestComponent {
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
      imports: [CommonModule, ReactiveFormsModule, FormsModule, NgModelArrayModule],
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
