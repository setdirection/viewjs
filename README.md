# ViewJS

## Installation
  
    npm install view
    viewjs project_name
    node project_name/app.js
    
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
### {View} = View view_name: ->
### {View} = @create view_name: mixins = {}
### @extend: mixins = {}
### @initialize: data = {}, ->
### views: [views...]

## Data
### model: Backbone.Model
### collection: Backbone.Collection
### value = @get key
### @set attributes = {}, options = silent: false

## DOM
### elements = @$ selector
### Element = @tag tag_name, attributes = {}, elements = [], content = ''
### render: template || ->
### element: ->
### delegate: event_name: selector: (event) ->
### document: Document
### templates: template_name: ->

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
### route: url
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