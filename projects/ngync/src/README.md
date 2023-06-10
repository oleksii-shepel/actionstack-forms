<h1>ngync</h1>

<p align="center">
  <img src="https://github.com/oleksii-shepel/angular-ngrx-forms/blob/master/projects/ngync/src/maskot.svg" alt="ngync" width="200"/>
</p>

  ![npm version](https://badge.fury.io/js/ngync.svg)
  ![Build Status](https://travis-ci.org/oleksii-shepel/angular-ngrx-forms.svg?branch=master)
  ![Coverage Status](https://coveralls.io/repos/github/oleksii-shepel/angular-ngrx-forms/badge.svg?branch=master)
  ![npm](https://img.shields.io/npm/dt/ngync.svg)
  ![npm](https://img.shields.io/npm/l/ngync.svg)

<h2>Introduction</h2>
<p align="justify">
<b>ngync</b> is a lightweight javascript library that helps to integrate Angular forms into NgRx store easily. You can forget the nightmare of doing it on your own. And all your knowledge of mastering Angular forms is also applicable in a new approach. Binding forms with the store with almost no efforts, isn't that delightful? No need of dispatching actions and writing reducers, no need of creating selectors in usual scenarios. Without further ado, all of this is already done by ngync.
</p>
<p align="justify">
<a href="https://ngrx.io/">NgRx</a> is a state management library for Angular applications. It provides a way to manage the state of your application in a predictable way. Also it helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.
</p>
<p align="justify">
<a href="https://angular.io/">Angular</a> in its turn provides two different approaches of handling user input through <a href="https://angular.io/guide/forms-overview">forms</a>: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes.
</p>
<p align="justify">
How can we unite both the worlds? The answer is simple: With help of <b>ngync</b> library. So, what is it and how it differs from other available solutions? Let me introduce it to you. 
</p>
<h2>Usage</h2>
<p align="justify">
If you know how to work with NgRx, you will also be comfortable using ngync. All you need to do is declare ngync directive on the form and provide it with the store path. It is an appropriate place where form data will be reliably reside during application execution. Here is an example of common form definition:
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
  debounce?: number;
  resetOnDestroy?: 'no-changes' | 'initial' | 'submitted' | 'empty';
  updateOn?: 'change' | 'blur' | 'submit';
  autoSubmit?: boolean;
}
```

<p align="justify">
Additionally, you have to import basic parts of ngync to your application. I'm talking about prepared meta-reducers, foundation functions that orchestrate all main functionality of the library. Вefore benefiting from their use, they have to be registered by NgRx store module. Nothing special, just another pint-sized prerequisites. All they do is handling of Redux action set. It is boilerplate functionality that is not more needed to be implemented time after time.
</p>
<p align="justify">
The code snippet of main NgModule shows how the import looks like:
</p>

```typescript
import { NgFormsModule, SharedModule, forms, logger } from 'ngync';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    StoreModule.forRoot(reducer, {
      metaReducers: [forms(initialState), logger()]
    }),

    NgFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<p align="justify">
Here we are putting into work two meta-reducers: one for form state syncing and one for logging. How could you guess, the first one is mandatory if you want to save state within the store, but the second is optional. It will come in handy by taking first steps. You can use it in a similar way to the Redux DevTools panel.
</p>
<p align="justify">
That's it, all settings are done and your form have to be synchronized with the store, now you can deep into exploration of internal processes.
</p>
<p align="justify">
By default, ngync will generate tracing actions every time user enters the data in the form. They have to be displayed in console of your browser. This behavior can be changed by passing on a special updateOn attribute to the directive. It can take one of three values: 'change', 'blur' or 'submit'. The tracing actions will be generated respectively every time user enters the data, when user leaves one of the form fields or when entire form is submitted or to be submitted.
</p>
<p align="justify">
If you may probably noticed, you do not must to dispatch any actions to the store. All the work is done by ngync behind the scenes. But if you definitely want to do it by yourself, you can do it without hesitation. There are four actions supported byngync right out of the box. I think, the names speak for themselves and the parameter list for each of them can be found in the source code of the library. Here is the list of actions:
</p>

```typescript
export enum FormActions {
  InitForm = '[Form] Init',
  UpdateValue = '[Form] Update Value',
  UpdateSubmitted = '[Form] Update Submitted',
}
```

<p align="justify">
As you can see you are completely redeemed from the tedium of implementation of constituent parts of the Redux pattern. In all the cases NgRx has detailed documentation that you may need in your work. This is foreign parish and we have to deal with it with all our passion and devotion.
</p>
<p align="justify">
I have to admit that there are no other docs of ngync except for this readme. It is probably a matter of time and interest. I stand for the idea that the best documentation is the code itself. Hopefully, it is concise and self describing. The library goes along with sample application which will help you orient in the theme. The link to the source repo of the project is <a href="https://github.com/oleksii-shepel/angular-ngrx-forms.git">angular-ngrx-forms</a>. If you have any questions or suggestions, I will respond as soon as possible.
</p>
<p align="justify">
The active phase of the project is passed by and the first version of software is packaged. The project is well-tested manually, but it lacks on comprehensive test coverage. Don't risk in production. It is free. You are allowed to use, copy and modify the codebase. I kindly recommend to join the project development in this repo. You are welcome!
</p>

<h2>Bonus</h2>
<p align="justify">
Of course, there is a bonus stored up together with the library. ngync has extended template-driven approach with missing feature of <b>ngModelArray</b>.
</p>
<p align="justify">
ngModelArray is a directive that can be used to group ngModel directives together into an array. It is designed to be used as a child of the ngForm directive. It also requires a name attribute so that the control can be registered with the parent ngForm directive under that name. The directive itself resides in NgFormsModule.
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
I hope you will enjoy using <b>ngync</b> and it will help you to create more robust and maintainable applications. And remember that the best is yet to come and state management can be easy. Stay tuned!
</p>

