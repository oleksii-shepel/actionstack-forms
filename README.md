# ngync

NgRx is a state management library for Angular applications. It provides a way to manage the state of your application in a predictable way. Also it helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.

Angular in its turn provides two different approaches to handling user input through forms: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes.

Now its time to introduce new child to the world!

ngync is a lightweight library to unite both the worlds. You can use all types of the forms and bind them together with the ngrx store with almost no efforts. All you need to do is declare ngync directive on the form and provide it with the path to store slice. Here is the example:

```angular
<form #form="ngForm" autocomplete="off" ngync="model">
  ...
</form>
```
Additionally, you have to import meta-reducers from ngync package and initialize store module with them. They are responsible for boilerplate functionality that is not needed to implement time after time. The code snippet of main NgModule shows how to import them properly:

```angular
  StoreModule.forRoot(reducer, {
    metaReducers: [forms(initialState), logger]
  })
   
``` 
That's it, you are completely redeemed from tedious chores of Redux pattern. In all other cases NgRx usage does not differ from ones described in its documentation. This is foreign parish and we have to deal with it with all our passion and devotion.

Currently there are no other docs of the library except this readme. But you probably do not need them at all. The code is concise and self describing. The library goes along with sample application which will help you take the first steps. 

The work on the project is almost done and “alpha” version of software is ready for download. It is free. You are allowed to use, copy and modify the codebase. I kindly recommend to join the project development in this repo. You are welcome!

There are some technical topics under consideration that will be taken into an account in common future. This is about store syncing strategies: onblur and onchange. Now due to ease of realisation the library utilizes only onchange one. But I hope both of them will be supported soon or later.

Of course, there are also bonuses. ngync has extended template-driven approach with missing feature of ngModelArray.

ngModelArray is a directive in Angular that can be used to group ngModel directives together. It creates and binds a FormArray instance to a DOM element.

Here is an example of how to use ngModelArray in Angular:

```angular
<form #form="ngForm">
  <div ngModelArray="aliases">
    <div *ngFor="let alias of model.aliases; let i=index; trackBy:trackById;">
      <input type="text" [(ngModel)]="model.aliases[i]" name="{{i}}">
    </div>
  </div>
</form>
```
In this example, the ngModelArray directive is used to arrange inputs together in an array within the aliases control.
