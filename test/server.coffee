#test
http = require 'http'
fs = require 'fs'

file_exists = (path) ->
  try
    fs.lstatSync path
    true
  catch e
    false

public = __dirname + '/../test/public'

{ViewServer} = require './view.server.js'

{TestServer} = ViewServer.create TestServer:
  public: public

module.exports.serverWithoutPortDoesNotListen = ->
  assert.isUndefined TestServer.server

module.exports.canServeStatic = (before_exit) ->
  {StaticServer1} = TestServer.create StaticServer1:
    port: 4001
  {StaticServer2} = TestServer.create StaticServer2:
    port: 4002
  request_count = 0
  http.get {host: 'localhost', port: 4001, path: '/test.html'}, (response) ->
    response.on 'data', (data) ->
      assert.equal 'Test',data.toString()
      ++request_count
      StaticServer1.server.close()
  http.get {host: 'localhost', port: 4002, path: '/test.html'}, (response) ->
    response.on 'data', (data) ->
      assert.equal 'Test',data.toString()
      ++request_count
      StaticServer2.server.close()
  before_exit ->
    assert.equal request_count, 2

module.exports.canServeBasicApp = (before_exit) ->
  request_count = 0
  
  {BasicAppServer} = TestServer.create BasicAppServer:
    port: 4003
    routes:
      '/': 'BasicView'
      '/template': 'TemplateView'
    execute: [
      "#{public}/javascripts/lib/jquery.js"
      "#{public}/javascripts/lib/underscore.js"
      "#{public}/javascripts/lib/backbone.js"
      "#{public}/javascripts/lib/view.js"
      "#{public}/javascripts/templates.js"
      "#{public}/javascripts/views/basic.js"
    ]
  
  http.get {host: 'localhost', port: 4003, path: '/'}, (response) ->
    ++request_count
    response.on 'data', (data) ->
      assert.match data.toString(), /<div>test<\/div>/
      
      http.get {host: 'localhost', port: 4003, path: '/template'}, (response) ->
        ++request_count
        response.on 'data', (data) ->
          assert.match data.toString(), /<p>value<\/p>/
          
          BasicAppServer.server.close()
          before_exit ->
            assert.equal request_count, 2

module.exports.canServeProxies = (before_exit) ->
  {ProxyServerSource1} = ViewServer.create ProxyServerSource1:
    port: 4004
  ProxyServerSource1.server.get '/1', (request,response) ->
    response.send 'a'
    
  {ProxyServerSource2} = ViewServer.create ProxyServerSource2:
    port: 4005
  ProxyServerSource2.server.get '/2', (request,response) ->
    response.send 'b'
    
  {ProxyServer} = ViewServer.create ProxyServer:
    port: 4006
    routes:
      '/a/': 4004
      '/b': 4005
  
  http.get {host: 'localhost', port: 4006, path: '/a/1'}, (response) ->
    response.on 'data', (data) ->
      assert.equal data.toString(), 'a'
      http.get {host: 'localhost', port: 4006, path: '/b/2'}, (response) ->
        response.on 'data', (data) ->
          ProxyServerSource1.server.close()
          ProxyServerSource2.server.close()
          ProxyServer.server.close()
          before_exit ->
            assert.equal data.toString(), 'b'

module.exports.envsExecuteCorrectly = (before_exit) ->
  ViewServer.env set:
    a: -> false
    b: true
    c: -> true
    
  {ConditionalViewServer} = TestServer.create ConditionalViewServer:
    port: 4007
    routes:
      '/': 'BasicView'
    execute: [
      "#{public}/javascripts/lib/jquery.js"
      "#{public}/javascripts/lib/underscore.js"
      "#{public}/javascripts/lib/backbone.js"
      "#{public}/javascripts/lib/view.js"
      "#{public}/javascripts/templates.js"
      "#{public}/javascripts/views/basic.js"
    ]
    env:
      a: ->
        stylesheets: ['a']
      b:
        stylesheets: ['b']
      c: ->
        stylesheets: 'c'
  
  http.get {host: 'localhost', port: 4007, path: '/'}, (response) ->
    response.on 'data', (data) ->
      before_exit ->
        assert.match data.toString(), /href="b"/
        assert.match data.toString(), /href="c"/
        assert.isNull data.toString().match /href="a"/
        ConditionalViewServer.server.close()

module.exports.canCache = (before_exit) ->  
  {CachingViewServer} = ViewServer.create CachingViewServer:
    port: 4008
    routes:
      '/': 'BasicView'
      '/template': 'TemplateView'
    cache: [
      'BasicView'
      'TemplateView'
    ]
    execute: [
      "#{public}/javascripts/lib/jquery.js"
      "#{public}/javascripts/lib/underscore.js"
      "#{public}/javascripts/lib/backbone.js"
      "#{public}/javascripts/lib/view.js"
      "#{public}/javascripts/templates.js"
      "#{public}/javascripts/views/basic.js"
    ]
  
  #test BasicView
  assert.equal false, file_exists public + '/index.html'
  http.get {host: 'localhost', port: 4008, path: '/'}, (response) ->
    assert.equal true, file_exists public + '/index.html'
    response.on 'data', (data) ->
      assert.equal data.toString(), fs.readFileSync public + '/index.html'
      #test TemplateView
      assert.equal false, file_exists public + '/template.html'
      http.get {host: 'localhost', port: 4008, path: '/template'}, (response) ->
        assert.equal true, file_exists public + '/template.html'
        response.on 'data', (data) ->
          before_exit ->
            assert.equal data.toString(), fs.readFileSync public + '/template.html'
            #cleanup
            fs.unlinkSync public + '/index.html'
            fs.unlinkSync public + '/template.html'
            CachingViewServer.server.close()