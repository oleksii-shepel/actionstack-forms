<h1>ngync mini</h1>

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
<b>ngync</b> is a lightweight JavaScript library designed to facilitate the integration of Angular forms with the NgRx store. This is a minimalistic version of the package for those who love simplicity. One of the key benefits of using ngync is that it enables form binding with the store effortlessly. This means that you don't have to go through the usual hassle of dispatching actions, writing reducers, or creating selectors. The library takes care of these tasks for you, eliminating the need for additional code and reducing the effort required. The library allows you to leverage your existing knowledge of working with Angular forms, no additional knowledge required.
</p>
<p align="justify">
Curious about bridging Angular Forms and NgRx store worlds? Allow me to unveil a remarkable solution: the ingenious <b>ngync</b> library. Prepare to be captivated as I unravel its unique characteristics and describe how it sets itself apart from other available alternatives. Let me introduce it to you. Application example is available at <a href="https://oleksii-shepel.github.io/angular-ngrx-forms/">Github Pages</a>.</p>
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
Additionally, you have to import ngync module to your application and set up meta-reducers. They are core functions that orchestrate all main functionality of the library. Before reaping the benefits of their power, these components must be registered with the NgRx store module. Don't worry, it's just another pint-sized prerequisite. Once registered, they take charge of handling the Redux action set, relieving you from the burden of implementing repetitive boilerplate functionality time and again.
</p>
<p align="justify">
The code snippet of main NgModule shows how the import looks like:
</p>

```typescript
import { NgFormsModule, forms } from 'ngync';

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
      metaReducers: [forms(initialState)]
    }),

    NgFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<p align="justify">
Behold, we now unveil a formidable forms meta-reducer that works tirelessly to synchronize the form state with the mighty NgRx store.
</p>
<p align="justify">
That's it, with all the settings in place, your form is now synchronized with the store.
</p>
<p align="justify">
If you may probably noticed, you do not must to dispatch any actions to the store. All the work is done by ngync behind the scenes. Sync directive is pretty smart and can initialize form controls automatically if the state is present in the store and also it can notice form submitting event. However, if you are determined to dispatch actions by yourself, feel free to proceed without any hesitation. There are only one action supported by ngync right out of the box. Its name is self-explanatory, and you can find the parameter list for it in the library's source code. Here is its definition:
</p>

```typescript
export enum FormActions {
  UpdateForm = '[Form] Update Form'
}
```

<p align="justify">
As you can see you are freed from the tedious task of implementing the various parts of the Redux pattern. Anyway NgRx offers comprehensive documentation to support you throughout your work. This is foreign parish and we have to deal with it with all our passion and devotion.
</p>
<p align="justify">
At present, the readme is the primary source of documentation for ngync, but rest assured that more resources may emerge in the future with growing interest. As an advocate for the belief that the code itself serves as the finest documentation, I have high hopes that it has been crafted to be concise and self-descriptive. To help you grasp the concepts, the library comes with a sample application that serves as a useful reference. You can find the source repository for the project at <a href="https://github.com/oleksii-shepel/angular-ngrx-forms.git">angular-ngrx-forms</a>. If you have any questions or suggestions, I will respond as soon as possible.
</p>
<p align="justify">
I sincerely hope that your experience with <b>ngync</b> brings you great joy and empowers you to develop highly robust and maintainable applications. Embrace the knowledge that the journey has just begun, and there are even greater advancements on the horizon. State management can indeed be made effortless. Stay tuned, as there's much more to come!</p>

