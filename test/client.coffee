assert = require 'assert'
{View,Builder,Router,RouteResolver} = require './view.client.js'
{jsdom} = require 'jsdom'
jQuery = require 'jquery'
Backbone = require 'backbone'
global.Backbone = Backbone

array_from = (object) ->
  return [] if not object
  length = object.length or 0
  results = new Array length
  while length--
    results[length] = object[length]
  results

View.extend
  env:
    set:test: true
  document: jsdom '<html><head></head><body></body></html>'

module.exports.parses = ->
  assert.ok(true)
  
module.exports.stack = (before_exit) ->
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
  StackView.initialize ->
    before_exit ->
      assert.equal StackView._stack.initialize.stack.length, 3
      assert.equal 2, i
      assert.equal StackView.a, 'a'
      assert.equal StackView.b, 'b'
      assert.equal sequence[0], 'a'
      assert.equal sequence[1], 'b'

module.exports.envBasics = ->
  View.env set:
    a: false
    b: -> true
  call_count = 0
  View.env
    a: ->
      ++call_count
    b: ->
      ++call_count
  assert.equal call_count, 1
  View.extend env:set:
    a: -> true
    b: false
  View.env
    a: ->
      ++call_count
  assert.equal call_count, 2
  View.env
    b: ->
      ++call_count
  assert.equal call_count, 2
  #non-existent env will not be called
  View.env c: ->
    ++call_count
  assert.equal call_count, 2


module.exports.canDeferViewManagerCallback = ->
  call_count = 0
  View QuantumView: ->
    ++call_count
  View.create QuantumView: {}
  assert.equal call_count, 1

module.exports.canTriggerEvents = ->
  {TestView} = View.create TestView: {}
  i = 0
  TestView.bind 'test', -> ++i
  TestView.trigger 'test'
  assert.equal i, 1

module.exports.canDetectModel = (before_exit) ->
  _model = false
  model = new Backbone.Model
  model.set key: 'value'
  {ModelView} = View.create ModelView:
    model: model
    initialize: (next) ->
      _model = @model
      next()
  ModelView.initialize -> before_exit ->
    assert.equal ModelView.model, model
    assert.equal _model, model
  
module.exports.canDetectCollection = (before_exit) ->
  _collection = false
  collection = new Backbone.Collection
  {CollectionView} = View.create CollectionView:
    collection: collection
    initialize: (next) ->
      _collection = @collection
      next()
  CollectionView.initialize ->
    before_exit ->
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

module.exports.canRenderCollection = ->
  Item = Backbone.Model.extend()
  List = new (Backbone.Collection.extend(model: Item))
  render_count = 0
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
      ++render_count
      @tag 'li', item.get 'content'

  ListView.initialize ->
    assert.equal @[0].tagName.toLowerCase(), 'ul'
  
    assert.equal render_count, 3
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'One'
    
    List.remove List.at(0)
    assert.equal render_count, 3
    assert.equal ListView[0].childNodes.length, 2
    assert.equal ListView[0].firstChild.innerHTML, 'Two'
    
    List.add content: 'Four'
    assert.equal render_count, 4
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'Two'
    assert.equal ListView[0].childNodes[2].innerHTML, 'Four'
    
    List.refresh contents
    assert.equal render_count, 7
    assert.equal ListView[0].childNodes.length, 3
    assert.equal ListView[0].firstChild.innerHTML, 'One'
    assert.equal ListView[0].childNodes[2].innerHTML, 'Three'

module.exports.viewManager = ->
  View.create TestView2: key: 'value'
  View.create TestView3: key: 'value2'
  [TestView2,TestView3] = View ['TestView2', 'TestView3']
  assert.equal TestView2.key, 'value'
  assert.equal TestView3.key, 'value2'
  
module.exports.canUseCreateAsCallback = ->
  instance = View.create ->
    @key = 'value'
  assert.equal instance.key, 'value'

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
    @on ready: ->
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

module.exports.canUseArrayInBuilder = (before_exit) ->
  {ArrayBuilderViewA,ArrayBuilderViewB,ArrayBuilderViewC} = View.create
    ArrayBuilderViewA:
      views: ['ArrayBuilderViewB','ArrayBuilderViewC']
      render: ->
        @tag 'ul', [@ArrayBuilderViewB,@ArrayBuilderViewC]
    ArrayBuilderViewB:
      render: ->
        @tag 'li', 'b'
    ArrayBuilderViewC:
      render: ->
        @tag 'li', 'c'
  ArrayBuilderViewA.initialize ->
    before_exit =>
      assert.ok @[0].firstChild.firstChild?
      assert.equal @[0].firstChild.firstChild.firstChild.innerHTML, 'b'
      
module.exports.router = (before_exit) ->
  #initial call sets
  View.extend routes: {
    '/': 'IndexView'
    '/post/:id': 'PostView'
    '/:a/:b/:c': 'AlphabetView'
  }
  
  View.extend
    env:set:
      server: -> false
      browser: -> false
  
  #views should be auto assigned routes after they are created
  #if they didn't exist at the time the router was called
  post_view_render_count = 0
  index_view_render_count = 0
  {PostView,IndexView,ContainerView} = View.create
    SidebarView: 
      render: ->
        @tag 'div', class: 'sidebar'
    PostView:
      on:
        change:id: ->
          @render()
      render: ->
        ++post_view_render_count
        @tag 'div', 'post'
    IndexView:
      render: ->
        ++index_view_render_count
        @tag 'div', 'index'
    ContainerView: [Router,
      views: ['SidebarView']
      render: ->
        element = @tag('div'
          @SidebarView
          @tag('div',
            @router
          )
        )
        element
    ]
    AlphabetView: {}
  
  #can turn a url into parsed view and params
  #can turn an object with params into a url 
  assert.deepEqual '/post/5', RouteResolver PostView: id: 5
  assert.deepEqual {PostView: id: "5"}, RouteResolver '/post/5'
  assert.deepEqual '/', RouteResolver IndexView: {}
  assert.deepEqual {IndexView: {}}, RouteResolver '/'
  assert.deepEqual {AlphabetView: {a:'a',b:'b',c:'c'}}, RouteResolver '/a/b/c'
  assert.deepEqual {AlphabetView: {a:'a',b:'b',c:'c'}}, RouteResolver '/a/b/c' 
  
  #router can resolve ordered params
  assert.equal '/a/b/c', RouteResolver(AlphabetView: ['a','b','c'])
    
  #view can generate a url for itself
  assert.equal '/post/5', PostView.url id: 5
  assert.equal '/', IndexView.url()
  assert.equal '/post/5', IndexView.url PostView: id: 5
  assert.equal '/', RouteResolver 'IndexView'
  
  #should have route auto set
  callback_count = 0
  ContainerView.initialize ->
  
    #use as dispatcher
    RouteResolver '/post/5', (view,params) ->
      #callback should only be called after 
      assert.equal view.get('id'), '5'
      assert.ok PostView.element().style.display isnt 'none'
      assert.ok IndexView.element().style.display is 'none'
      ++callback_count
      
    #dispatcher can take object argument
    RouteResolver {IndexView: {}}, (view,params) ->
      assert.ok IndexView.element().style.display isnt 'none'
      assert.ok PostView.element().style.display is 'none'
      ++callback_count
      
    #dispatcher can take ordered param argument
    RouteResolver {PostView:['4']}, (view,params) ->
      assert.equal view.get('id'), '4'
      assert.ok PostView.element().style.display isnt 'none'
      assert.ok IndexView.element().style.display is 'none'
      ++callback_count
      
    #IndexView should not re-render
    RouteResolver {IndexView: {}}, (view,params) ->
      assert.ok IndexView.element().style.display isnt 'none'
      assert.ok PostView.element().style.display is 'none'
      ++callback_count
      
    #default logic of hiding siblings can be disabled
    PostView.unbind 'route'
    RouteResolver {PostView: id: 4}, (view,params) ->
      assert.ok IndexView.element().style.display is 'none'
      assert.ok PostView.element().style.display isnt 'none'
      ++callback_count
      
  before_exit ->
    assert.equal 5, callback_count
    assert.equal 4, post_view_render_count
    assert.equal 1, index_view_render_count

  View.extend
    env:
      server: -> true
      browser: -> false

module.exports.canPassDataInitialize = (before_exit) ->
  model = new Backbone.Model
  collection = new Backbone.Collection
  attributes = {key:'value'}
  model_view = View.create()
  model_view.initialize model, ->
    assert.equal model_view.model, model
    collection_view = View.create()
    collection_view.initialize collection, ->
      assert.equal collection_view.collection, collection
      attributes_view = View.create()
      attributes_view.initialize attributes, ->
      before_exit ->
        assert.equal attributes.key, attributes_view.get 'key'

module.exports.canUse$InBuilder = (before_exit) ->
  click_count = 0
  {$BuilderView} = View.create $BuilderView: [Builder,
    $: jQuery
    delegate:
      'click div': ->
        ++click_count
      click:
        div: ->
          ++click_count
    render: ->
      @key = 'test'
      @table(
        @tr(
          @td(),
          @td(
            @div().click =>
              ++click_count
              assert.equal @key, 'test'
          )
        )
      )
  ]
  $BuilderView.initialize -> before_exit ->
    $BuilderView.$('div').trigger('click')
    assert.equal click_count, 3
    assert.equal $BuilderView.$('td').length, 2
  
module.exports.canReverseLookup = ->
  {ReverseLookupView} = View.create ReverseLookupView:
    $: jQuery
  ReverseLookupView.initialize ->
    assert.equal jQuery(@).view().name, 'ReverseLookupView'
    assert.equal @$.view().name, 'ReverseLookupView'

module.exports.anonViewHasElement = ->
  anon = View.create()
  assert.ok anon[0]
  assert.equal anon[0].tagName, 'DIV'