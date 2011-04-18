# ViewJS

TODO: create JS that will hide all descriptions for quick API overview

## Concepts

- Run JavaScript client or server
- Mixin system (describe extend)
- Builder + inline jQuery

## Installation
    
    mkdir project_name
    cd project_name
    npm install view
    node_modules/view/bin/bootstrap
    node app.js

## Project Structure

## Development
Run this command from your project:

    cake watch

This will compile the following stylus and coffeescript files:

- stylesheets -> public/stylesheets
- models -> public/javascripts/models
- collections -> public/javascripts/collections
- controllers -> public/javascripts/controllers
- views -> public/javascripts/views
- templates -> public/javascripts/templates.js

**Note that you need to restart the cake watch process when you create new files, this will be automatic in the future.**

# Client

## View
The View class represents a DOM Element, a set of behaviors associated with it (event handlers, custom initializers, custom methods, etc) and possibly a Model or Collection that is bound to the view. All views are mixins and can be extended and sub classed at any time.

### View view_name
Find a view by name:

    ContactView = View 'ContactView'

### View view_name: ->

Passing in name: callback pairs will call the callback with the view as it's context when the view is available:

    View
      ContactView: ->
        @initialize()

### @create view_name: mixins
Create a named view with the given mixins. You can pass a single mixin object, or an array of mixins. Nested arrays will be flattened.

    View.create ParentView:
      render: 'parent.eco'
      on:
        render: ->
          console.log 'render event triggered'
        
    View.create BuilderView: [Builder,
      render: ->
        @div()
    ]

Calling create on a named view creates a child view that will process all of the mixins of the parent view (effectively cloning it) in addition to the mixins passed into create:

    {ChildView} = ParentView.create ChildView:
      render: 'child.eco'
      on:
        render: ->
          console.log 'render event triggered'
        #render now has two event handlers

Some mixin directives like **render** will overwrite an existing callback, while others like **on** will bind additional events without unregistering old events.

Calling create on a named view with no arguments creates an unnamed clone of the view.

    anonymous_view = ChildView.create()

### @extend mixin
All mixins passed to **create()** are then passed to **extend**. @extend looks for directives to process the attributes in the mixin (**render**,**initialize**,**on**, etc are all directives). If none are found the attribute becomes an attribute of the view.

    {PostView} = View.create PostView:
      render: 'post.eco' #processed with render directive
      key: 'value'
    PostView.key is 'value'

### @extend extend: directive_name: (directive_value) ->
Extend itself can be extended to process new directives. If you view the ViewJS source code you will see this is how ViewJS itself is constructed. The "on" directive is implemented roughly like this:

    View.extend extend:on: (events) ->
      for event_name, callback of events
        @bind event_name, callback
  
    #now "on" can be passed to extend
    View.extend
      on:
        render: ->
          console.log 'Called when any view renders'

A **discard** callback is always passed as the second argument to a directive processor. Call this when a directive should only be processed once and not when child views are created. 
  
    View.extend extend:routes: (routes,discard) ->
      #process routes once then
      discard()

### @extend initialize: (next) ->
Add an asynchronous initialize callback to the view. **The callback must call next** or the view will never finish initializing. Note that initialize callbacks are added to a stack of existing callbacks. Child views specifying an initialize callback will not overwrite the parent's callback.

    {PostCollectionView} = View.create PostCollectionView:
      render: 'post_preview.eco'
      collection: PostCollection
      initialize: (next) ->
        @collection.fetch success: next

### @initialize: attributes = {}, ->
Initializes a given view. Optional attributes will be passed to **set()** and an optional callback will be called when initialize is complete.

    $('body').append PostCollectionView
    PostCollectionView.initialize ->
      console.log 'called when initialize is complete'

### @extend views: [views...]
Specifies dependent views that will be loaded. Each dependent view add an **initialize** callback. The parent view will not finish initializing until the dependent views have finished initializing. Once finished the dependent view names will become available as properties of the parent view:

    {ApplicationView} = View.create ApplicationView: [Builder,
      views: ['PostCollectionView','SideBarView']
      render: ->
        @div(
          @div class: 'main', @PostCollectionView
          @div class: 'sidebar', @SideBarView
        )
    ]

## Data
### @extend model: Backbone.Model
Specify a model for the view. Designed with Backbone.Model in mind, but can be any object that has an **attributes** property. The **attributes** property of the model will be passed as the context to a template if one is specified for the view. If using a callback with **render** the model will be accessed as **@model**.
    
    post = new Backbone.Model title: 'Post Title'
    {PostView} = View.create PostView:
      render: 'post.eco'
      model: post
    
    # post.eco
    # <h2><%= @title %></h2>
    
### @extend collection: Backbone.Collection
**render()** will be called for each model in the collection, with the model as the context to a template, or as the first argument to a callback. Asynchronous collection logic must be put into an  **initialize** callback or a **change** or **change:key** event.

    {PostCollectionView} = View.create PostCollectionView:
      render: 'post_preview.eco'
      collection: PostCollection
      initialize: (next) ->
        @collection.fetch success: next
      
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
Generate a DOM Element. Accepts a variable number of hashes of attributes, elements, other views, strings of content or a functions to call, or arrays (which can be nested) of any of the above, in any order. If Builder is passed as a mixin all valid tag names become available as methods.

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

If a DOM library is present @tag and Builder methods will instead return a wrapped object containing the element (i.e. a jQuery or Zepto array). View will always look inside these objects for the actual elements so in practice you can use them as if they were the Element objects, with the added benefit of attaching event handlers inline, etc:

    @ul @li @a('Link',href:'#').click ->

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

### @extend helpers: template_helpers
Adds helper methods to templates:

    View.extend helpers:
      url: (params) ->
        @url params

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
    
### @extend templates: template_name: ->
**ViewServer** will automatically compile the contents of the **templates** directory and set this property accordingly, but if using **View** standalone this property should contain filename: callback pairs. The callbacks must return HTML strings and **not** DOM Elements. The **templates** attribute must be set on the base **View** object.

    View.extend
      templates:
        'post.eco': (attributes) ->
          "html output"

## Events
The following events are triggered internally by View:

- **initialize: ->** Triggered when the view is initialized.
- **change: ->** Triggered when any attribute in the view has changed.
- **change:key: (value) ->** Triggered when a particular key changes.
- **ready: ->** Triggered the first time a view is rendered.
- **render: ->** Triggered when a view is rendered.
- **activated: ->** Triggered when a route activates the view.
- **deactivated: ->** Triggered when a view was active, and another view is activated by a route.
- **error: (error) ->** Triggered when an exception is thrown.
- **warning: (warning) ->** Triggered when a warning (such as a deprecation) occurs.

### @bind event_name, callback
### @on event_name, callback
Bind a callback to an event. **bind** and **on** are aliases.
    
    PostView.bind 'render', ->
      console.log 'Post rendered'

An object containing event name, callback pairs can also be used:

    PostView.on
      render: ->
        console.log 'Post rendered'
      initialize: ->
        console.log 'Post initialized'
        
### @extend on: events
The same behavior can be achieved using a mixin:

    PostView.extend
      on:
        render: ->
          console.log 'Post rendered'

### @unbind/removeListener event_name = false, handler = ->

    PostView.unbind 'render', handler #unbinds a particular handler
    PostView.unbind 'render' #unbinds all render handlers
    PostView.unbind() #unbinds all

**Unbinding all is not recommended** as there are many internal events.

### @trigger/emit event_name, args...
Trigger a given event with an arbitrary number of arguments.

    PostView.bind 'custom', (arg1,arg2) ->
    PostView.trigger 'custom', arg1, arg2

### @before: method_name: (original_method,args...) ->
A simple implementation of AOP. A logger could be implemented as:

    View.extend log: (method_name) ->
      @before method_name, (next,args...) ->
        response = next.apply @, args
        console.log "#{@name}.#{method_name}", args, ' -> ', response
        response
    
    View.log 'set'
    View.log 'get'
    
    instance = View.create()
    instance.set key: 'value'
      
## Env
Allows for the conditional execution of code depending on environment. The following environments are built in:

- **server**:  Executed when the application is being processed by NodeJS
- **browser**: Executed by a remote client / web browser. **Note that this will become "client" in a future release, but is not presently so due to internal usage. Usage of "browser" will continue to work but will issue a deprecation warning in the future.**

### @env: name: ->

    View.env
      server: -> console.log 'only run on the server'
      browser: -> console.log 'only run on a browser'

### @env: set: name: ->
New environment names can be set using the **set** key:

    View.env set:
      ie: -> !!window.attachEvent and not window.opera
    
### @extend env: name: ->
The **env** directive can be used in a mixin.

    View.extend
      env:
        ie: ->
          @on render: -> console.log 'render called in IE'

### @extend env: name: mixin
The **env** directive in a mixin, can itself contain a mixin that will be passed to extend.

    View.extend
      env:
        ie:
          on:
            render: -> console.log 'render called in IE'

## Routes
### routes: path: view_name
This is automatically set by the **ViewServer**, but when using View standalone you must manually set this before you can use the **Router** mixin. Attributes matched in a route will be **@set** on the view when it is **activated**.

    View.extend
      routes:
        '/about/': 'AboutPageView'
        '/contact/': 'ContactPageView'
        '/blog/:post_id': 'PostView'

### @url view_name: attributes
Generates a URL for a given view and attributes. The view must have a corresponding route.

    '/post/5' is View.url PostView: id: 5
    '/post/5' is PostView.url id: 5
    '/' is View.url IndexView: {}
    '/' is IndexView.url()
    
## Mixins
### Router
The Router uses the excellent [https://github.com/balupton/History.js/](History.js) to manage the history state in the browser. **The recommended behavior is to serve browsers incapable of supporting the HTML5 history API a static HTML snapshot of the view.** The **ViewServer** provides the **legacy** and **html5** directives to **@env** to easily allow this.

When a view is activated by a route the **deactivated** event is triggered on the previous activated view, and the **activated** event is triggered on the newly active view. Client side the deactivated view is hidden and the activated view is shown. Server side, all views but the activated one will be removed from the DOM before it is serialized.

Each application that uses Routes must mixin the Router once. The Router mixin makes available **@Router** which will contain a div, which itself contains all of the elements of the routed views.

    View.extend
      routes:
        '/about/': 'AboutPageView'
        '/contact/': 'ContactPageView'
        '/blog/:post_id': 'PostView'
    
    View.create
      ApplicationView: [Router,
        render: ->
          @div @Router
      ]
      
      AboutPageView:
        render: 'about.eco'
      
      ContactPageView:
        render: 'contact.eco'
      
      PostView:
        render: 'post.eco'
        on:
          change:
            post_id: (post_id) ->
              Post.find post_id, (post) =>
                @model = post
                @render()

### Builder
The builder mixin adds all valid HTML5 tag names as methods to a view. Usage of Builder is covered in the **tag** method.

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

# ViewServer
## ViewServer
### ViewServer view_name
Find a ViewServer by name:

    BlogServer = View 'BlogServer'

### ViewServer server_name: ->
Passing in name: callback pairs will call the callback with the ViewServer as it's context when the ViewServer is available:

    ViewServer BlogServer: ->
      @server.use express.logger() 

### @create server_name: mixins
The ViewServer's mixin system and create method works identically to View's.

    ViewServer.create BlogServer: ->
      port: 3001
      public: __dirname + '/public'

## Server
### @server
The Express instance which handles requests for the ViewServer.
    
    express = require 'express'
    BlogServer.server.use express.logger()
    BlogServer.server.get '/custom/', (request,response) ->

### @extend server: express_instance
If no **server** attribute is supplied, an Express server will automatically be created. Or you can supply a custom one:

    express = require 'express'
    server = express.createServer()
    {BlogServer} = ViewServer.create
      server: server

### @extend port: number
The port number to listen on. When both **port** and **public** have been defined in the server **@server.listen()** will be called.

### @extend public: path
Full path to the public directory. When both **port** and **public** have been defined in the server **@server.listen()** will be called.

### @extend templates: path
Full path to the templates directory. All eco and Jade templates in this directory will automatically be compiled to **public/javascripts/templates.js** when running the **cake watch** command.

## Assets
### @extend javascripts: [javascripts...]
JavaScript tags to send to the browser on each request. If a directory is specified it will be recursively searched for **.js** files.

    public = "#{__dirname}/public/javascripts/lib/"
    BlogServer.extend javascripts: [
      "#{public}/javascripts/lib/view.js"
      "#{public}/javascripts/models/"
      "#{public}/javascripts/views/"
    ]
    
### @extend execute: [execute...]
JavaScript to execute server side on each request. If a directory is specified it will be recursively searched for **.js** files.

    public = "#{__dirname}/public/javascripts/lib/"
    BlogServer.extend execute: [
      "#{public}/javascripts/lib/view.js"
      "#{public}/javascripts/models/"
      "#{public}/javascripts/views/"
    ]
    

### @extend stylesheets: [stylesheets...]
Add stylesheets to. If a directory is specified it will be recursively searched for **.css** files.

    public = "#{__dirname}/public/"
    BlogServer.extend stylesheets: [
      "#{public}/stylesheets/a.css"
      "#{public}/stylesheets/b.css"
      #now scan the directory for all remaining stylesheets
      "#{public}/stylesheets/"
    ]

### @extend meta: [meta...]
Inject arbitrary meta information into the document head.

    BlogServer.extend meta: [
      '<link rel="alternate" type="application/rss+xml" title="Feed Name" href="url" />'
    ]

## Env
Execute code, or process mixin directives conditionally per request. The following environments are pre-defined:

- **html5**: If the user-agent supports the HTML5 history API.
- **legacy**: If the user-agent does not support the HTML5 history API.

### @env: request, name: ->

    View.env request,
      html5: ->
        console.log 'only run when an HTML5 capable user agent initiated the request'
      legacy: (request) ->
        console.log 'only run when a non HTML5 capable user agent initiated the request'

### @extend: env: name: mixin
The following mixin directives can be used in an **env** directive:

- **execute**
- **javascripts**
- **stylesheets**
- **meta**

In the following example the Typekit JavaScript would be available in a script tag in the header for both legacy and HTML5 capable browsers, but the rest of the application would be run server side for legacy browsers, and client side for HTML5 browsers.

    public = __dirname + '/public/'
    application_payload = [
      "#{public}javascripts/lib/jquery.js"
      "#{public}javascripts/lib/underscore.js"
      "#{public}javascripts/lib/backbone.js"
      "#{public}javascripts/lib/view.js"
      "#{public}javascripts/templates.js"
      "#{public}javascripts/models"
      "#{public}javascripts/views"
    ]
    
    {MyServer} = ViewServer.create MyServer:
      public: public
      javascripts: [
        "http://use.typekit.com/xxx.js"
      ]
      env:
        legacy:
          execute: application_payload
        html5:
          javascripts: application_payload

### @env: set: name: (request) ->
Define a new environment. Request may not be present, so always check for **request?** first.

    ViewServer.env set:
      ios: (request) ->
        request? and request.headers['user-agent'].match /(iPhone|iPad)/
        
Not all environments depend on the request object. The following example sets **development** and **production** environments based on wether or not the code is run in the [VMWare Cloud Foundry](http://www.cloudfoundry.com/) offering:

    ViewServer.env set:
      production: ->
        process?.env?.VCAP_APPLICATION
      development: ->
        not process?.env?.VCAP_APPLICATION

## Events
The following events are triggered internally by ViewServer:

- **error: (error) ->** Triggered when an exception is thrown.
- **warning: (warning) ->** Triggered when a warning (such as a deprecation) occurs.
- **request: (request,response) ->** Triggered when an incoming request will be handled by a view.

### @bind event_name, callback
### @on event_name, callback
Bind a callback to an event. **bind** and **on** are aliases.
    
    BlogServer.bind 'request', (request,response) ->
      console.log 'Incoming request'

An object containing event name, callback pairs can also be used:

    BlogServer.on
      request: (request,response) ->
        console.log 'Incoming request'
        
### @extend on: events
The same behavior can be achieved using a mixin:

    BlogServer.extend
      on:
        request: (request,response) ->
          console.log 'Incoming request'

### @unbind/removeListener event_name = false, handler = ->

    BlogServer.unbind 'error', handler #unbinds a particular handler
    BlogServer.unbind 'error' #unbinds all error handlers
    BlogServer.unbind() #unbinds all

### @trigger/emit event_name, args...
Trigger a given event with an arbitrary number of arguments.

    BlogServer.bind 'custom', (arg1,arg2) ->
    BlogServer.trigger 'custom', arg1, arg2

## Routes
### @extend routes: path: view_name
Will register **get** handlers in express that will serve or execute JavaScript depending on the contents of the **execute** and **javascripts** directives, and will pass through route definitions to **View.routes** automatically.

    BlogServer.extend
      routes:
        '/': 'IndexView'
        '/post/:id': 'PostView'
        
You can optionally pass a callback for low level control just like in Express. Specifying a port number will proxy all requests below that path to the given port number, specifying a fully qualified URL will proxy all requests below that path to the given URL.

    BlogServer.extend
      routes:
        '/local_api/': 3002
        '/remote_api/': "http://api.service.com/"
        '/page/:name': (request,response) ->
          response.send 'Page Contents'
    
    # reqests to:
    # /local_api/posts/2.json would proxy the request to: localhost:3002/posts/2.json
    # /remote_api/posts/2.json would proxy the request to: http://api.service.com/posts/2.json
    
## Cache
### cache: [views...]
TODO