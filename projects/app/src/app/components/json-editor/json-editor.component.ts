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
    changes['data'].previousValue = changes['data'].previousValue ?? {};
    changes['data'].currentValue = changes['data'].currentValue ?? {};
    if(deepEqual(changes['data'].previousValue, changes['data'].currentValue)) { return; }

    let diff = difference(changes['data'].previousValue, changes['data'].currentValue);
    let changedProperties = "";

    if(diff.changed) {
      changedProperties = "Changed: ";
      let props = findProps(diff.changed);
      for(let prop of props) {
        changedProperties += `<b>${prop}</b> (${getValue(diff.changed, prop)}), `;
      }
      changedProperties = changedProperties.replace(/, $/, "<br/>");
    }

    if (diff.removed) {
      changedProperties += "Removed: ";
      Object.keys(diff.removed).forEach(x => changedProperties += `<b>${x}</b>, `);
      changedProperties = changedProperties.replace(/, $/, "<br/>");
    }

    if(diff.added) {
      changedProperties += "Added: ";
      Object.keys(diff.added).forEach(x => changedProperties += `<b>${x}</b>, `);
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
