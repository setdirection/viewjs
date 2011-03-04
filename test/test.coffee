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
    initialize: (args...,next) ->
      @a = 'a'
      ++i
      next()
  MiddlewareView.initialize.add (args...,next) ->
    @b = 'b'
    ++i
    next()
  MiddlewareView.initialize()
  assert.equal 2, i
  assert.equal MiddlewareView.a, 'a'
  assert.equal MiddlewareView.b, 'b'
  
module.exports.canDetectModel = ->
  model = new Backbone.Model
  model.set key: 'value'
  view = View.create
    model: model
  assert.equal view.model, model
  instance = new view model
  assert.equal instance.model, model
  
module.exports.canDetectCollection = ->
  collection = new Backbone.Collection
  view = View.create
    collection: collection
  assert.equal view.collection, collection
  instance = new view collection
  assert.equal instance.collection, collection