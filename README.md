# ViewJS

## Concepts

- Run JavaScript client or server
- Mixin system (describe extend)

## Installation
    
    mkdir project_name
    cd project_name
    npm install view
    node_modules/view/bin/bootstrap
    node app.js

## Project Structure

## Development

    cake watch

This will compile the following stylus and coffeescript files:

- stylesheets -> public/stylesheets
- models -> public/javascripts/models
- collections -> public/javascripts/collections
- controllers -> public/javascripts/controllers
- views -> public/javascripts/views
- templates -> public/javascripts/templates.js

# Client

## View
### View view_name
Find a view by name:

    ContactView = View 'ContactView'

Passing in name: callback pairs will call the callback with the view as it's context when the view is created:

    View
      ContactView: ->
        @initialize()

### @create view_name: mixins
Create a named view with the given mixins. You can pass a single mixin object, or an array of mixins. Nested arrays will be flattened.

    View.create ParentView:
      render: 'parent.eco'

    View.create BuilderView: [Builder,
      render: ->
        @div ''
    ]

You can create a 

    {ChildView} = ParentView.create ChildView:
      

Calling create on a named view with no arguments creates an unnamed clone of the view.

    anonymous_view = ChildView.create()

### @extend mixins
### @extend extend: name
code

### @initialize: data = {}, ->
### views: [views...]

## Data
### model: Backbone.Model
Specify a model for the view. Designed with Backbone.Model in mind, but can be any object that has an **attributes** property. The **attributes** property of the model will be passed as the context to a template if one is specified for the view. If using a callback with **render** the model will be accessed as **@model**.
    
    post = new Backbone.Model title: 'Post Title'
    {PostView} = View.create PostView:
      render: 'post.eco'
      model: post
    
    #post.eco
    <h2><%= @title %></h2>
    
### collection: Backbone.Collection
**render()** will be called for each model in the collection, with the model as the context to a template, or as the first argument to a callback.

    {PostCollectionView} = View.create PostCollectionView:
      collection: PostCollection
      render: 'post_preview.eco'
      
collection is designed for use with a Backbone.Collection, but any class conforming to the following API will work:

- method: bind(event_name,listener)
- event: all() 
- event: add(model)
- event: remove(model) 
- event: refresh() 

### @get key

    title = PostView.model.get 'title'
    
### @set attributes = {}, options = silent: false
Set attributes on a view. By default this will trigger **change** and **change:key** events. Pass "{silent:true}" as the second argument to prevent those events from being triggered. Note that these attributes are not persisted to a view's model if present.
    
    View PostView: ->
      @on change: -> @render()
      @set title: 'Title One' #render() called
      @set {title: 'Title Two'}, {silent: true} #render() not called

### @name
The name of the view.

## DOM
### @extend $: Library
Set the DOM library to use (currently jQuery or Zepto are the only supported libraries). Must be set on the base **View** object. A DOM library is not required to use ViewJS.

    View.extend
      $: jQuery

### @$ selector
When using a DOM library $ is available as a hybrid object and function. The function will act as the selector, and the object will contain all of the attributes of an Element wrapped by the DOM library (hide/show/addClass/etc). Note that the **element** object and $ method are always available, but the view will not contain any content until **initialize** has finished.

    PostView.$.hide() #hide while loading
    PostView.initialize ->
      @$.show()
      @$('li').addClass 'item'
      
### @tag tag_name, attributes = {}, elements = [], content = '', ->
Generate a DOM Element. Accepts a variable number of hashes of attributes, elements, strings of content or a functions to call, or arrays (which can be nested) of any of the above, in any order. If Builder is passed as a mixin all valid tag names become available as methods.

    {TableView} = View.create TableView: [Builder,
      render: ->
        @table cellpadding: 0, cellspacing: 0,
          @tbody(
            @tr(
              @td 'Cell One'
              @td 'Cell Two'
            )
          )
    ]
    
    #without Builder
    {ListView} = View.create ListView:
      render: ->
        @tag('ul',@tag('li','Item One'))

### @extend render: template
Specify a template to render:

    View.create PostView:
      model: post
      render: 'post.eco'
    
### @extend render: ->
or pass a callback. Callbacks work best with **Builder**, but . Asynchronous logic  should be put inside of **initialize** or a **change:key** event handler.

    View.create PostView: [Builder,
      model: post
      render: ->
        @div class: 'post',
          @a('My Link',href: '#').click -> false
          @h2 @model.get 'title'
    ]
    
### @render()
render() is automatically called when **initialize()** has completed. Subsequent calls to render() will replace the contents of the view's **element**.

    View.create PostView:
      render: 'post.eco'
      on:
        change:
          id: (id) ->
            Post.find id, (post) =>
              @model = post
              @render()
    
### @element
The outer most DOM Element in the view which is available as soon as the view is created (before **initialize** or **render** are called). The Element is never removed even when the view is re-rendered.

    $('body').append PostView
    PostView.$.html() #empty
    PostView.initialize ->
      @$.html() #contents of post.eco
      
### @extend element: -> Element
Override the default element which is a div with a className containing the **name** attribute of the view.

    {PostCollectionView} = View.create
      PostCollectionView: [Builder,
        collection: PostCollection
        element: ->
          @ul()
        render: (post) ->
          @li post.get 'title'
      ]

### @extend delegate: events

    View.create PostView:
      delegate:
        'click a.class': (event) ->
    
### templates: template_name: ->
**ViewServer** will automatically compile the contents of the **templates** directory and set this property accordingly, but if using **View** standalone this property should contain filename: callback pairs. The callbacks must return HTML strings and **not** DOM Elements. The **templates** attribute must be set on the base **View** object.

    View.extend
      templates:
        'post.eco': (attributes) ->
          "html output"

## Events
### @bind/on: event_name, (args...) ->
### @unbind/removeListener event_name = false, handler = ->
### @trigger/emit event_name, args...
### @before: method_name: (original_method) ->
#### change: ->
#### change:key: (value) ->
#### ready: ->
#### error: (error) ->
#### warning: (warning)

## Env
### @env: env_name: ->
#### server
#### client
#### browser

## Routes
### routes: path: view_name
### url = @url view_name: attributes: {}

## Mixins
### Builder
### Router

# ViewServer
## ViewServer
### {ViewServer} = ViewServer server_name: ->
### {ViewServer} = @create server_name: mixins = {}

## Server
### server: express_instance
### port: number
### templates: path
### public: path

## Assets
### @javascripts: [javascripts...]
### @execute: [execute...]
### @stylesheets: [stylesheets...]

## Events
### @bind/on: event_name, (args...) ->
### @unbind/removeListener event_name = false, handler = ->
### @trigger/emit event_name, args...
#### window:created (window) ->
#### window:render (window,request) ->
#### error: (error) ->
#### warning: (warning)

## Env
### @env: env_name: ->

## Routes
### routes: path: view_name

## Cache
### cache: [views...]