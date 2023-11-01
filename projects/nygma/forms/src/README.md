<h1>nygma-forms</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/oleksii-shepel/angular-ngrx-forms/nygma/projects/nygma/forms/src/emblem.png" alt="nygma" width="600"/>
</p>

  ![npm version](https://badge.fury.io/js/nygma-forms.svg)
  ![Build Status](https://github.com/oleksii-shepel/angular-ngrx-forms/workflows/build/badge.svg)
  ![Coverage Status](https://coveralls.io/repos/github/oleksii-shepel/angular-ngrx-forms/badge.svg?branch=master)
  ![npm](https://img.shields.io/npm/dt/nygma-forms.svg)
  ![npm](https://img.shields.io/npm/l/nygma-forms.svg)

<h2>Introduction</h2>
<p>

</p>
<p align="justify">
<b>nygma-forms</b> is a lightweight JavaScript library designed to facilitate the integration of Angular forms into the NgRx store. It aims to simplify the developing process by taking care of keeping states in sync what can be challenging when done manually. One of the key benefits of using nygma is that it enables form binding with the store effortlessly. This means that you don't have to go through the usual hassle of dispatching actions, writing reducers, or creating selectors. The library takes care of these tasks for you, eliminating the need for additional code and reducing the effort required. The library allows you to leverage your existing knowledge of working with Angular forms, no additional knowledge required.
</p>
<p align="justify">
<a href="https://ngrx.io/">NgRx</a> is a state management library tailor-made for Angular applications, granting you the extraordinary ability to fashion software. Inspired by the renowned Redux, NgRx harnesses the power of a single source of truth, empowering you to disentangle concerns and navigate through debugging with unparalleled ease. Prepare to unlock a world of enhanced applications with NgRx at your side!
</p>
<p align="justify">
Within the vast <a href="https://angular.io/">Angular</a> ecosystem, you'll discover two distinct methodologies for managing user input through forms: reactive forms and template-driven forms. Whether you choose Angular equips you with powerful tools to effectively handle user interactions and effortlessly manage form-related tasks.
</p>
<p align="justify">
Curious about bridging these worlds? Allow me to unveil my solution: the ingenious <b>nygma</b> library. Prepare to be captivated as I unravel its unique characteristics and describe how it sets itself apart from other available alternatives. Let me introduce it to you. Application example is available at <a href="https://oleksii-shepel.github.io/angular-ngrx-forms/">Github Pages</a>.</p>
<h2>Usage</h2>
<p align="justify">
If you know how to work with NgRx, you will also be comfortable using nygma-forms. All you need to do is declare sync directive on the form and provide it with the store path. This magic spell ensures that your form data finds a safe place throughout your application's execution. Here is an example of regular form definition:
</p>

```typescript
<form #form="ngForm" autocomplete="off" sync="path.to.form">
  ...
</form>
```

<p align="justify">
sync directive expects from user a string that consists of a sequence of property names separated by dots. The first property name is the feature slice. The last property name is the name of the property that will contain form data. All intermediate property names are the names of the properties that will be created in the store if they do not exist.
</p>
<p align="justify">
<i>*** In more sophisticated scenarios you may probably need to parametrize each particular sync directive with additional parameters. You can do this by setting up the global config token SYNC_OPTIONS_TOKEN or by passing on a config object to the directive directly. There are following config options available for you:</i>
</p>

```typescript
export interface SyncOptions {
  slice: string;
  debounceTime?: number;
  updateOn?: 'change' | 'blur' | 'submit';
}
```
<p align="justify">
Additionally, you have to import NgFormsModule to your application and set up meta-reducers. They are core functions that orchestrate all main functionality of the library. Before reaping the benefits of their power, these components must be registered with the NgRx store module. Don't worry, it's just another pint-sized prerequisite. Once registered, they take charge of handling the Redux action set, relieving you from the burden of implementing repetitive boilerplate functionality time and again.
</p>
<p align="justify">
The code snippet of main NgModule shows how the import looks like:
</p>

```typescript
import { NgFormsModule, forms } from 'nygma-forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    NgFormsModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [forms(initialState, {showOnlyModifiers: true})]
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
That's it, with all the settings in place, your form will be synchronized with the store. It's time to embark on an exciting journey and delve into the exploration of internal processes.
</p>
<p align="justify">
By default, the library will generate tracing for actions every time user enters the data in the form. They have to be displayed in console of your browser. This behavior can be changed by passing on a special updateOn attribute to the directive. It can take one of three values: 'change', 'blur' or 'submit'. The action will be generated respectively every time user enters the data, when user leaves one of the form fields or when entire form is submitted or to be submitted.
</p>
<p align="justify">
If you may probably noticed, you do not must to dispatch any actions to the store by yourself. All the work is done by nygma behind the scenes. Sync directive is pretty smart and can initialize form controls automatically if the state is present in the store and also it can notice form submitting event. However, if you are determined to dispatch actions, feel free to proceed without any hesitation. There are two actions supported by nygma-forms right out of the box. Their names are self-explanatory, and you can find the parameter list for each action in the library's source code:
</p>

```typescript
export enum FormActions {
  UpdateForm    = '@forms/form/update',
  UpdateControl = '@forms/form/control/update',
}
```
<p align="justify">
To help you grasp the concepts, the library comes with a sample application that serves as a useful reference. You can find the source repository for the project on Github at <a href="https://github.com/oleksii-shepel/angular-ngrx-forms.git">angular-ngrx-forms</a>.
</p>
<p align="justify">
I sincerely hope that your experience with the library brings you great joy and empowers you to develop highly robust and maintainable applications. Stay tuned and have fun by programming!</p>

