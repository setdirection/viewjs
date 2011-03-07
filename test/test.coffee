assert = require 'assert'
{View,Builder} = require '../view.js'
{jsdom} = require 'jsdom'
Backbone = require 'backbone'
array_from = (object) ->
  return [] if not object
  length = object.length or 0
  results = new Array length
  while length--
    results[length] = object[length]
  results

View.extend
  document: jsdom '<html><head></head><body></body></html>'
#Backbone = require 'backbone'

module.exports.parses = ->
  assert.ok(true)
  
module.exports.stack = ->
  i = 0
  sequence = []
  {StackView} = View.create
    StackView:
      stack:initialize:add: (next) ->
        sequence.push 'a'
        @a = 'a'
        ++i
        next()

  StackView.extend stack:initialize:add: (next) ->
    sequence.push 'b'
    @b = 'b'
    ++i
    next()
  StackView.initialize()
  
  assert.equal StackView._stack.initialize.stack.length, 3
  assert.equal 2, i
  assert.equal StackView.a, 'a'
  assert.equal StackView.b, 'b'
  assert.equal sequence[0], 'a'
  assert.equal sequence[1], 'b'

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
      render: ->
        @p 'test'
      on:ready: ->
        assert.equal @[0].firstChild.innerHTML, 'test'
    ]
  
  View BuilderView: -> @initialize()
  
  BuilderView = View.create Builder,
  BuilderView.initialize()

module.exports.canRenderCollection = ->
  Item = Backbone.Model.extend()
  List = new (Backbone.Collection.extend(model: Item))
  
  contents = [
    {content: 'One'}
    {content: 'Two'}
    {content: 'Three'}
  ]
  List.add array_from contents
  {ListView} = View.create ListView:
    collection: List
    element: -> @tag 'ul'
    render: (item) ->
      @tag 'li', item.get 'content'

  ListView.initialize ->
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'One'
    List.remove List.at(0)
    
    assert.equal ListView[0].childNodes.length, 2
    assert.equal ListView[0].firstChild.innerHTML, 'Two'
    List.add content: 'Four'
    
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'Two'
    assert.equal ListView[0].childNodes[2].innerHTML, 'Four'
    List.refresh contents
    
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'One'
    assert.equal ListView[0].childNodes[2].innerHTML, 'Three'

module.exports.viewManager = ->
  View.create TestView2: key: 'value'
  View.create TestView3: key: 'value2'
  [TestView2,TestView3] = View 'TestView2', 'TestView3', (TestView2,TestView3) ->
    assert.equal TestView2.key, 'value'
    assert.equal TestView3.key, 'value2'
  assert.equal TestView2.key, 'value'
  assert.equal TestView3.key, 'value2'
  
module.exports.canDepend = ->
  sequence = []
  View.create
    ParentView:
      views: ['ChildView1','ChildView2','ChildView3']
      initialize: (next) ->
        assert.equal @ChildView1.name, 'ChildView1'
        assert.equal @ChildView2.name, 'ChildView2'
        assert.equal @ChildView3.name, 'ChildView3'
        next()
    ChildView1: 
      name: 'ChildView1'
      render: ->
        sequence.push 'a'
        @document.createElement 'div'
    ChildView2:
      name: 'ChildView2'
      render: ->
        sequence.push 'b'
        @document.createElement 'div'
    ChildView3:
      name: 'ChildView3'
      render: ->
        sequence.push 'c'
        @document.createElement 'div'
  View ParentView: ->
    @initialize()
    @ready ->
      assert.equal sequence[0], 'a'
      assert.equal sequence[1], 'b'
      assert.equal sequence[2], 'c'
      
module.exports.canPassViewsToBuilder = ->
  {OuterView} = View.create OuterView: [Builder, 
    initialize: (next) ->
      InnerView.on ready: next
      InnerView.initialize()
    render: ->
      @div InnerView, class: 'test'
    on:ready: ->
      assert.equal @[0].firstChild.firstChild.firstChild.innerHTML, 'test'
  ]
  {InnerView} = View.create InnerView: [Builder,
    render: ->
      @p 'test'
  ]
  
  OuterView.initialize()

module.exports.canDiscardMixin = ->
  View.extend extend:discard: (value,discard) ->
    @discard = value
    discard()
    
  {DiscardView} = View.create
    DiscardView: {}
  
  DiscardView.extend
    discard: 'discard'
    
  {DiscardChildView} = DiscardView.create DiscardChildView: {}
  
  assert.equal DiscardView.discard, 'discard'
  assert.equal typeof DiscardChildView.discard, 'undefined'

module.exports.canObserveKeyChanges = ->
  _a = ''
  _b = ''
  _c = ''
  {KeyChangeView} = View.create KeyChangeView:
    on:
      change:
        a: (a) -> _a = a
        b: (b) -> _b = b
  KeyChangeView.bind 'change:c', (c) -> _c = c
  KeyChangeView.set a: 'a', b: 'b', c: 'c'
  
  assert.equal _a, 'a'
  assert.equal _b, 'b'
  assert.equal _c, 'c'
  
module.exports.canHaveDefaults = ->
  {DefaultsView} = View.create DefaultsView:
    defaults:
      key: 'value'
  assert.equal DefaultsView.get('key'), 'value'
  assert.equal DefaultsView.create().get('key'), 'value'