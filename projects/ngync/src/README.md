# ngync

<title>ngync</title>
<meta name="msvalidate.01" content="746448BECF636696648D538712C076A5" />
<meta name="google-site-verification" content="gUYAvvRwZBDCzZKzVQFSQuT1EcB388v1awWJ8PICJKk" />

<p align="center">
  <img src="maskot.svg" alt="ngync" width="200"/>
</p>

**ngync** is a lightweight javascript library that helps to integrate Angular forms into NgRx store easily. You can forget the nightmare of doing it on your own. And all your knowledge of mastering Angular forms is also applicable in a new approach. Binding forms with the store with almost no efforts, isn't that delightful? No need of dispatching actions and writing reducers, no need of creating selectors in usual scenarios. Without further ado, all of this is already done by ngync.

[NgRx](https://ngrx.io/) is a state management library for Angular applications. It provides a way to manage the state of your application in a predictable way. Also it helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.

[Angular](https://angular.io/) in its turn provides two different approaches of handling user input through [forms](https://angular.io/guide/forms-overview): reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes.

How can we unite both the worlds? The answer is simple: With help of **ngync** library. So, what is it and how it differs from other available solutions? Let me introduce it to you. 

If you know how to work with NgRx, you will also be comfortable using ngync. All you need to do is declare ngync directive on the form and provide it with the store path. It is an appropriate place where form data will be reliably reside during application execution. Here is an example of common form definition:

```typescript
<form #form="ngForm" autocomplete="off" ngync="model">
  ...
</form>
```

ngync directive expects from user a string that consists of a sequence of property names separated by dots. The first property name is the name of the root property in the store. The last property name is the name of the property that will contain form data. All intermediate property names are the names of the properties that will be created in the store if they do not exist.

Additionally, you have to import basic parts of ngync to your application. I'm talking about prepared meta-reducers, foundation functions that orchestrate all main functionality of the library. Вefore benefiting from their use, they have to be registered by NgRx store module. Nothing special, just another pint-sized prerequisites. All they do is handling of Redux action set. It is boilerplate functionality that is not more needed to be implemented time after time.

The code snippet of main NgModule shows how the import looks like:

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

Here we are putting into work two meta-reducers: one for form state syncing and one for logging. How could you guess, the first one is mandatory if you want to save state within the store, but the second is optional. It will come in handy by taking first steps. You can use it in a similar way to the Redux DevTools panel.

That's it, all settings are done and your form have to be synchronized with the store, now you can deep into exploration of internal processes.

By default, ngync will generate tracing actions every time user enters the data in the form. They have to be displayed in console of your browser. This behavior can be changed by passing on a special updateOn attribute to the directive. It can take one of three values: 'change', 'blur' or 'submit'. The tracing actions will be generated respectively every time user enters the data, when user leaves one of the form fields or when entire form is submitted or to be submitted.

If you may probably noticed, you do not must to dispatch any actions to the store. All the work is done by ngync behind the scenes. But if you definitely want to do it by yourself, you can do it without hesitation. There are four actions supported byngync right out of the box. I think, the names speak for themselves and the parameter list for each of them can be found in the source code of the library. Here is the list of actions:

```typescript
export enum FormActions {
  InitForm = '[Form] Init',
  UpdateValue = '[Form] Update Value',
  UpdateSubmitted = '[Form] Update Submitted',
}
```

As you can see you are completely redeemed from the tedium of implementation of constituent parts of the Redux pattern. In all the cases NgRx has detailed documentation that you may need in your work. This is foreign parish and we have to deal with it with all our passion and devotion.

I have to admit that there are no other docs ofngync except this readme. It is probably a matter of time and interest. I stand for the idea that the best documentation is the code itself. Hopefully, it is concise and self describing. The library goes along with sample application which will help you orient in the theme. The link to the source repo of the project is [angular-ngrx-forms](https://github.com/oleksii-shepel/angular-ngrx-forms.git). 
If you have any questions or suggestions, I will respond as soon as possible.

The active phase of the project is passed by and the first version of software is packaged. The project is well-tested manually, but it lacks on comprehensive test coverage. Don't risk in production. It is free. You are allowed to use, copy and modify the codebase. I kindly recommend to join the project development in this repo. You are welcome!

Of course, there is a bonus stored up together with the library. ngync has extended template-driven approach with missing feature of **ngModelArray**.

ngModelArray is a directive that can be used to group ngModel directives together into an array. It is designed to be used as a child of the ngForm directive. It also requires a name attribute so that the control can be registered with the parent ngForm directive under that name.

Here is an example of how to organically combine it with ngModels:

```typescript
<form #form="ngForm">
  <div ngModelArray="aliases">
    <div *ngFor="let alias of model.aliases; let i=index; trackBy:trackById;">
      <input type="text" [(ngModel)]="model.aliases[i]" name="{{i}}">
    </div>
  </div>
</form>
```

For more information about ngModelArray, see the [Angular documentation](https://angular.io/api/forms/NgModelArray). Just a jest!

I hope you will enjoy using **ngync** and it will help you to create more robust and maintainable applications. And remember that the best is yet to come and state management can be easy. Stay tuned!
