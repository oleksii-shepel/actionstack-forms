<h1>ngync</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/oleksii-shepel/angular-ngrx-forms/master/projects/ngync/src/maskot.png" alt="ngync" width="250"/>
</p>

  ![npm version](https://badge.fury.io/js/ngync.svg)
  ![Build Status](https://github.com/oleksii-shepel/angular-ngrx-forms/workflows/build/badge.svg)
  ![Coverage Status](https://coveralls.io/repos/github/oleksii-shepel/angular-ngrx-forms/badge.svg?branch=master)
  ![npm](https://img.shields.io/npm/dt/ngync.svg)
  ![npm](https://img.shields.io/npm/l/ngync.svg)

<h2>Introduction</h2>
<p>

</p>
<p align="justify">
<b>ngync</b> is a lightweight JavaScript library designed to facilitate the integration of Angular forms with the NgRx store. It aims to simplify the developing process by taking care of keeping states in sync what can be challenging when done manually. One of the key benefits of using ngync is that it enables form binding with the store effortlessly. This means that you don't have to go through the usual hassle of dispatching actions, writing reducers, or creating selectors. The library takes care of these tasks for you, eliminating the need for additional code and reducing the effort required. The library allows you to leverage your existing knowledge of working with Angular forms, no additional knowledge required.
</p>
<p align="justify">
<a href="https://ngrx.io/">NgRx</a> is a state management library tailor-made for Angular applications, granting you the extraordinary ability to fashion software. Inspired by the renowned Redux, NgRx harnesses the power of a single source of truth, empowering you to disentangle concerns and navigate through debugging with unparalleled ease. Prepare to unlock a world of enhanced application development possibilities with NgRx at your side!
</p>
<p align="justify">
Within the vast <a href="https://angular.io/">Angular</a> ecosystem, you'll discover two distinct methodologies for managing user input through forms: reactive forms and template-driven forms. Whether you choose Angular equips you with powerful tools to effectively handle user interactions and effortlessly manage form-related tasks.
</p>
<p align="justify">
Curious about bridging these worlds? Allow me to unveil a remarkable solution: the ingenious <b>ngync</b> library. Prepare to be captivated as I unravel its unique characteristics and describe how it sets itself apart from other available alternatives. Let me introduce it to you. Application example is available at <a href="https://oleksii-shepel.github.io/angular-ngrx-forms/">Github Pages</a>.</p>
<h2>Usage</h2>
<p align="justify">
If you know how to work with NgRx, you will also be comfortable using ngync. All you need to do is declare ngync directive on the form and provide it with the store path. This magic spell ensures that your form data finds a safe place throughout your application's execution. Here is an example of common form definition:
</p>

```typescript
<form #form="ngForm" autocomplete="off" ngync="model">
  ...
</form>
```

<p align="justify">
ngync directive expects from user a string that consists of a sequence of property names separated by dots. The first property name is the name of the root property in the store. The last property name is the name of the property that will contain form data. All intermediate property names are the names of the properties that will be created in the store if they do not exist.
</p>
<p align="justify">
<i>*** In more sophisticated scenarios you may probably need to parametrize each separate ngync directive with additional parameters. You can do it by setting up the global config token NGYNC_CONFIG_TOKEN or by passing on a config object to the directive directly. There are following config options available for you:</i>
</p>

```typescript
export interface NgyncConfig {
  slice: string;
  debounceTime?: number;
  updateOn?: 'change' | 'blur' | 'submit';
  enableQueue?: boolean;
}
```
<p align="justify">
<i>*** I highly recommend you to enable the action queue as it is made by default. It is a new feature of ngync that will save you a lot of time and efforts by developing. The option is appropriate not only for setting the correct initialization order, it also fixes an issue related to action dispatching internals. I mean the dispatching of actions from an incorrect context. For some reason ActionsSubject instance within NgRx store does not propagate such actions to their subscribers, even if reducer handles them as usual. The issue itself has a solution, but it is not emphasized.</i>
</p>
<p align="justify">
Additionally, you have to import ngync module to your application and set up meta-reducers. They are core functions that orchestrate all main functionality of the library. Before reaping the benefits of their power, these components must be registered with the NgRx store module. Don't worry, it's just another pint-sized prerequisite. Once registered, they take charge of handling the Redux action set, relieving you from the burden of implementing repetitive boilerplate functionality time and again.
</p>
<p align="justify">
The code snippet of main NgModule shows how the import looks like:
</p>

```typescript
import { NgFormsModule, NgModelArrayModule, forms, logger } from 'ngync';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    NgFormsModule,
    NgModelArrayModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [logger({showOnlyModifiers: true}), forms(initialState)]
    }),

    NgFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<p align="justify">
Behold, we now unveil a formidable forms meta-reducer that works tirelessly to synchronize the form state with the mighty NgRx store. The beloved logger meta-reducer we once cherished is turned to life. It is extended with the new action filters and is fully ready for serving its purpose.
</p>
<p align="justify">
That's it, with all the settings in place, your form is now synchronized with the store. It's time to embark on an exciting journey and delve into the exploration of internal processes.
</p>
<p align="justify">
By default, ngync will generate tracing actions every time user enters the data in the form. They have to be displayed in console of your browser. This behavior can be changed by passing on a special updateOn attribute to the directive. It can take one of three values: 'change', 'blur' or 'submit'. The tracing actions will be generated respectively every time user enters the data, when user leaves one of the form fields or when entire form is submitted or to be submitted.
</p>
<p align="justify">
If you may probably noticed, you do not must to dispatch any actions to the store. All the work is done by ngync behind the scenes. Sync directive is pretty smart and can initialize form controls automatically if the state is present in the store and also it can notice form submitting event. However, if you are determined to dispatch actions by yourself, feel free to proceed without any hesitation. There are three actions supported by ngync right out of the box. Their names are self-explanatory, and you can find the parameter list for each action in the library's source code. Here is a condensed list of actions (note that there are additional actions available, but it's crucial to understand their influence before utilizing them):
</p>

```typescript
export enum FormActions {
  UpdateForm = '[Form] Update Form',
  UpdateProperty = '[Form] Update Property',
  ResetForm = '[Form] Reset Form'
}
```

<p align="justify">
As you can see you are freed from the tedious task of implementing the various parts of the Redux pattern. Anyway NgRx offers comprehensive documentation to support you throughout your work. This is foreign parish and we have to deal with it with all our passion and devotion.
</p>
<p align="justify">
At present, the readme is the primary source of documentation for ngync, but rest assured that more resources may emerge in the future with growing interest. As an advocate for the belief that the code itself serves as the finest documentation, I have high hopes that it has been crafted to be concise and self-descriptive. To help you grasp the concepts, the library comes with a sample application that serves as a useful reference. You can find the source repository for the project at <a href="https://github.com/oleksii-shepel/angular-ngrx-forms.git">angular-ngrx-forms</a>. If you have any questions or suggestions, I will respond as soon as possible.
</p>
<h2>Bonus</h2>
<p align="justify">
Indeed, ngync has an exciting bonus in store for you. It extends the template-driven approach by providing a missing feature of <b>ngModelArray</b>.
</p>
<p align="justify">
ngModelArray is a powerful directive that allows you to group multiple ngModel directives into an array. It is designed to be used as a child of the ngForm directive. It also requires a name attribute so that the control can be registered with the parent ngForm directive under that name. The directive itself resides in <b>NgFormsModule</b>.
</p>
<p align="justify">
Here is an example of how to combine it with ngModels instances seamlessly:
</p>

```typescript
<form #form="ngForm">
  <div ngModelArray="aliases">
    <div *ngFor="let alias of model.aliases; let i=index; trackBy:trackById;">
      <input type="text" [(ngModel)]="model.aliases[i]" name="{{i}}">
    </div>
  </div>
</form>
```

<p align="justify">
For more information about ngModelArray, see the <a href="https://angular.io/api/forms/NgModelArray">documentation</a>. Just a jest!
</p>
<p align="justify">
I sincerely hope that your experience with <b>ngync</b> brings you great joy and empowers you to develop highly robust and maintainable applications. Embrace the knowledge that the journey has just begun, and there are even greater advancements on the horizon. State management can indeed be made effortless. Stay tuned, as there's much more to come!</p>

