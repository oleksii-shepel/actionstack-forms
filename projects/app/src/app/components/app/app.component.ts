import { Component, HostBinding } from '@angular/core';

export type EditorType = 'reactive' | 'template-driven' | 'standard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @HostBinding('class') class ='author';

  editor: EditorType = 'reactive';

  get showReactiveProfileEditor() {
    return this.editor === 'reactive';
  }

  get showTemplateProfileEditor() {
    return this.editor === 'template-driven';
  }

  get showStandardProfileEditor() {
    return this.editor === 'standard';
  }

  toggleEditor(type: EditorType) {
    this.editor = type;
    switch(type) {
      case 'reactive':
        this.class = 'author';
        break;
      case 'template-driven':
        this.class = 'agent';
        break;
      case 'standard':
        this.class = 'model';
        break;
    }
  }
}
