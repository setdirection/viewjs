assert = require 'assert'
{View} = require '../view.js'
{jsdom} = require 'jsdom'
Backbone = require 'backbone'

View.extend
  document: jsdom '<html><head></head><body></body></html>'
#Backbone = require 'backbone'

module.exports.parses = ->
  assert.ok(true)
  
module.exports.middleware = ->
  i = 0
  MiddlewareView = View.create
    initialize: (next) ->
      @a = 'a'
      ++i
      next()
  MiddlewareView.initialize.add (next) ->
    @b = 'b'
    ++i
    next()
  MiddlewareView.initialize()
  
  assert.equal View.initialize.stack.length, 1
  assert.equal 2, i
  assert.equal MiddlewareView.a, 'a'
  assert.equal MiddlewareView.b, 'b'
  
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
