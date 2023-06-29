import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { deepEqual, difference, findProps, getValue } from 'ngync';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnChanges {
  JSON = JSON;
  changes = "";

  @Input() data: any = {};
  @Input() collapsed = true;
  @Output() collapsedChange = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges) {
    const previousValue = changes['data']?.previousValue ?? {};
    const currentValue = changes['data']?.currentValue ?? {};

    if(deepEqual(previousValue, currentValue)) { return; }

    const diff = difference(previousValue, currentValue);
    let changedProperties = "";

    if(diff.changed) {
      changedProperties = "Changed: ";
      const props = findProps(diff.changed);
      for(const prop of props) {
        changedProperties += `<b>${prop}</b> (${getValue(diff.changed, prop)}), `;
      }
      changedProperties = changedProperties.replace(/, $/, "<br/>");
    }

    if (diff.removed) {
      changedProperties += "Removed: ";
      findProps(diff.removed).forEach(x => changedProperties += `<b>${x}</b>, `);
      changedProperties = changedProperties.replace(/, $/, "<br/>");
    }

    if(diff.added) {
      changedProperties += "Added: ";
      findProps(diff.added).forEach(x => changedProperties += `<b>${x}</b>, `);
      changedProperties = changedProperties.replace(/, $/, "<br/>");
    }

    changedProperties = changedProperties.replace(/<br\/>$/, "");

    this.changes = `<span>${changedProperties}</span>`;
    this.data = changes['data'].currentValue;
  }

  toggle(collapsed: boolean) {
    this.collapsed = !collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
