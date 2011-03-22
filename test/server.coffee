#test
http = require 'http'

{ViewServer} = require './view.server.js'

{TestServer} = ViewServer.create TestServer:
  public: './test/public'

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
  public = __dirname + '/../test/public'
  
  {BasicAppServer} = TestServer.create BasicAppServer:
    port: 4003
    templates: './test/templates'
    routes:
      '/': 'BasicView'
      '/template': 'TemplateView'
    execute: [
      "#{public}/javascripts/lib/jquery.js"
      "#{public}/javascripts/lib/underscore.js"
      "#{public}/javascripts/lib/backbone.js"
      "#{public}/javascripts/lib/view.js"
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