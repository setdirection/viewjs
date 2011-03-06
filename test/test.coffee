assert = require 'assert'
{View,Builder} = require '../view.js'
{jsdom} = require 'jsdom'
Backbone = require 'backbone'

View.extend
  document: jsdom '<html><head></head><body></body></html>'
#Backbone = require 'backbone'

module.exports.parses = ->
  assert.ok(true)
  
module.exports.stack = ->
  i = 0
  StackView = View.create()
  StackView.extend
    stack:initialize:add: (next) ->
      @a = 'a'
      ++i
      next()
  
  StackView.extend stack:initialize:add: (next) ->
    @b = 'b'
    ++i
    next()
  StackView.initialize()
  
  assert.equal View._stack.initialize.stack.length, 1
  assert.equal StackView._stack.initialize.stack.length, 3
  assert.equal 2, i
  assert.equal StackView.a, 'a'
  assert.equal StackView.b, 'b'

module.exports.canTriggerEvents = ->
  view = View.create()
  i = 0
  view.bind 'test', -> ++i
  view.trigger 'test'
  assert.equal i, 1

module.exports.canDetectModel = ->
  _model = false
  model = new Backbone.Model
  model.set key: 'value'
  view = View.create
    model: model
    initialize: (next) ->
      _model = @model
      next()
  view.initialize()
  assert.equal view.model, model
  assert.equal _model, model
  
module.exports.canDetectCollection = ->
  _collection = false
  collection = new Backbone.Collection
  view = View.create
    collection: collection
    initialize: (next) ->
      _collection = @collection
      next()
  view.initialize()
  assert.equal view.collection, collection
  assert.equal view.collection, _collection

module.exports.canRender = ->
  BuilderView = View.create Builder,
    render: (args...,next) ->
      next @p 'test'
    on:ready: ->
      assert.equal @[0].firstChild.innerHTML, 'test'
  BuilderView.initialize()

module.exports.canPassViewsToBuilder = ->
  BuilderView = View.create Builder
  
  OuterView = BuilderView.create
    initialize: (next) ->
      InnerView.on ready: next
      InnerView.initialize()
    render: (next) ->
      next(@div InnerView, class: 'test')
    on:ready: ->
      assert.equal @[0].firstChild.firstChild.firstChild.innerHTML, 'test'
      
  InnerView = BuilderView.create
    render: (next) ->
      next @p 'test'
  
  OuterView.initialize()
