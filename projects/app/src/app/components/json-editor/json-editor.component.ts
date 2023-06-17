import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { findProps, getValue } from 'ngync';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.css'],
})
export class JsonEditorComponent implements OnChanges {
  JSON = JSON;
  changes = "";

  @Input() data: any = {};
  @Input() collapsed = true;
  @Output() collapsedChange = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges) {
    if((!changes['data'].previousValue || !changes['data'].currentValue)) {
      return;
    }

    let prevProps = findProps(changes['data'].previousValue);
    let currProps = findProps(changes['data'].currentValue);
    let prevIntersection = prevProps.filter(x => currProps.includes(x));
    let currIntersection = currProps.filter(x => prevProps.includes(x));
    let changedProperties = "";
    if(changes['data'].firstChange === false) {
      if(currIntersection.length === prevIntersection.length) {
        // no changes in length
        changedProperties = "Changed: ";
        let changed = false;
        for(let prop of currIntersection) {
          let prevValue = getValue(changes['data'].previousValue, prop);
          let currValue = getValue(changes['data'].currentValue, prop);
          if(prevValue !== currValue) {
            changedProperties += `<b>${prop}</b> (${currValue}), `;
            changed = true;
          }
        }
        changedProperties = changedProperties.replace(/, $/, "<br/>");

        if(!changed){
          changedProperties = changedProperties.replace(/Changed\: /, "");
        }
      }

      if (prevProps.length > prevIntersection.length) {
        // removed
        changedProperties += "Removed: ";
        prevProps.filter(x => !prevIntersection.includes(x)).forEach(x => changedProperties += `<b>${x}</b>, `);
        changedProperties = changedProperties.replace(/, $/, "<br/>");
      }

      if(currProps.length > currIntersection.length) {
        // added
        changedProperties += "Added: ";
        currProps.filter(x => !currIntersection.includes(x)).forEach(x => changedProperties += `<b>${x}</b>, `);
        changedProperties = changedProperties.replace(/, $/, "<br/>");
      }

      changedProperties = changedProperties.replace(/<br\/>$/, "");
    }
    this.changes = `<span>${changedProperties}</span>`;
    this.data = changes['data'].currentValue;
  }

  toggle(collapsed: boolean) {
    this.collapsed = !collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
