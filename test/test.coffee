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
  {StackView} = View.create
    StackView:
      stack:initialize:add: (next) ->
        @a = 'a'
        ++i
        next()

  StackView.extend stack:initialize:add: (next) ->
    @b = 'b'
    ++i
    next()
  StackView.initialize()
  
  assert.equal StackView._stack.initialize.stack.length, 3
  assert.equal 2, i
  assert.equal StackView.a, 'a'
  assert.equal StackView.b, 'b'

module.exports.canTriggerEvents = ->
  {TestView} = View.create TestView: {}
  i = 0
  TestView.bind 'test', -> ++i
  TestView.trigger 'test'
  assert.equal i, 1

module.exports.canDetectModel = ->
  _model = false
  model = new Backbone.Model
  model.set key: 'value'
  {ModelView} = View.create ModelView:
    model: model
    initialize: (next) ->
      _model = @model
      next()
  ModelView.initialize()
  assert.equal ModelView.model, model
  assert.equal _model, model
  
module.exports.canDetectCollection = ->
  _collection = false
  collection = new Backbone.Collection
  {CollectionView} = View.create CollectionView:
    collection: collection
    initialize: (next) ->
      _collection = @collection
      next()
  CollectionView.initialize()
  assert.equal CollectionView.collection, collection
  assert.equal CollectionView.collection, _collection

module.exports.canRender = ->
  {BuilderView} = View.create BuilderView: [Builder,
      render: (args...,next) ->
        next @p 'test'
      on:ready: ->
        assert.equal @[0].firstChild.innerHTML, 'test'
    ]
  
  View BuilderView: -> @initialize()
  
  BuilderView = View.create Builder,
  BuilderView.initialize()

module.exports.viewManager = ->
  View.create TestView2: key: 'value'
  View.create TestView3: key: 'value2'
  [TestView2,TestView3] = View 'TestView2', 'TestView3', (TestView2,TestView3) ->
    assert.equal TestView2.key, 'value'
    assert.equal TestView3.key, 'value2'
  assert.equal TestView2.key, 'value'
  assert.equal TestView3.key, 'value2'

module.exports.canPassViewsToBuilder = ->
  {OuterView} = View.create OuterView: [Builder, 
    initialize: (next) ->
      InnerView.on ready: next
      InnerView.initialize()
    render: (next) ->
      next(@div InnerView, class: 'test')
    on:ready: ->
      assert.equal @[0].firstChild.firstChild.firstChild.innerHTML, 'test'
  ]
  {InnerView} = View.create InnerView: [Builder,
    render: (next) ->
      next @p 'test'
  ]
  
  OuterView.initialize()
