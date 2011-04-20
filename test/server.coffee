#TODO: use next() to unindent
#TODO: figure out why there is cross server config contamination

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

test_stack = []

test_stack.push (next) ->
  {StaticServer1} = TestServer.create StaticServer1:
    port: 40001
  {StaticServer2} = TestServer.create StaticServer2:
    port: 40002
  request_count = 0
  http.get {host: 'localhost', port: 40001, path: '/test.html'}, (response) ->
    response.on 'data', (data) ->
      assert.equal 'Test',data.toString()
      StaticServer1.server.close()
      http.get {host: 'localhost', port: 40002, path: '/test.html'}, (response) ->
        response.on 'data', (data) ->
          assert.equal 'Test',data.toString()
          StaticServer2.server.close()
          next()

test_stack.push (next) ->
  request_count = 0
  {BasicAppServer} = TestServer.create BasicAppServer:
    port: 40003
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
    javascripts: [
      "http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"
    ]
  
  http.get {host: 'localhost', port: 40003, path: '/'}, (response) ->
    ++request_count
    response.on 'data', (data) ->
      assert.match data.toString(), /<div>test<\/div>/
      assert.match data.toString(), /src="http:\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1.5.1\/jquery.min.js"/
          
      http.get {host: 'localhost', port: 40003, path: '/template'}, (response) ->
        ++request_count
        response.on 'data', (data) ->
          assert.match data.toString(), /<p>value<\/p>/
          
          BasicAppServer.server.close()
          assert.equal request_count, 2
          next()

test_stack.push (next) ->
  {ProxyServerSource1} = ViewServer.create ProxyServerSource1:
    port: 40004
  ProxyServerSource1.server.get '/1', (request,response) ->
    response.send 'a'
    
  {ProxyServerSource2} = ViewServer.create ProxyServerSource2:
    port: 40005
  ProxyServerSource2.server.get '/2', (request,response) ->
    response.send 'b'
    
  {ProxyServer} = ViewServer.create ProxyServer:
    port: 40006
    routes:
      '/a/': 40004
      '/b': 40005
    
  http.get {host: 'localhost', port: 40006, path: '/a/1'}, (response) ->
    response.on 'data', (data) ->
      assert.equal data.toString(), 'a'
      http.get {host: 'localhost', port: 40006, path: '/b/2'}, (response) ->
        response.on 'data', (data) ->
          ProxyServerSource1.server.close()
          ProxyServerSource2.server.close()
          ProxyServer.server.close()
          assert.equal data.toString(), 'b'
          
          next()
          
test_stack.push (next) ->
  ViewServer.env set:
    a: -> false
    b: true
    c: -> true
    
  a_was_set = false
  b_was_set = false
  c_was_set = false
  
  ViewServer.env false,
    a: -> a_was_set = true
    b: -> b_was_set = true
    c: -> c_was_set = true
  
  assert.equal a_was_set, false
  assert.equal b_was_set, true
  assert.equal c_was_set, true
  
  {ConditionalViewServer} = TestServer.create ConditionalViewServer:
    port: 40007
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
  
  http.get {host: 'localhost', port: 40007, path: '/'}, (response) ->
    response.on 'data', (data) ->
      assert.match data.toString(), /href="b"/
      assert.match data.toString(), /href="c"/
      assert.isNull data.toString().match /href="a"/
      ConditionalViewServer.server.close()
      next()
      
test_stack.push (next) ->
  {CachingViewServer} = TestServer.create CachingViewServer:
    port: 40008
    routes:
      '/': 'BasicView'
      '/test/test2/test3/test4/test5/template': 'TemplateView'
      '/text': 'TextView'
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
  
  cache_location = public + '/../cache'
  
  fs.unlinkSync cache_location + '/index.html' if file_exists cache_location + '/index.html'
  fs.unlinkSync cache_location + '/test/test2/test3/test4/test5/template.html' if file_exists cache_location + '/test/test2/test3/test4/test5/template.html'
  fs.rmdirSync cache_location + '/test/test2/test3/test4/test5' if file_exists cache_location + '/test/test2/test3/test4/test5'
  fs.rmdirSync cache_location + '/test/test2/test3/test4' if file_exists cache_location + '/test/test2/test3/test4'
  fs.rmdirSync cache_location + '/test/test2/test3' if file_exists cache_location + '/test/test2/test3'
  fs.rmdirSync cache_location + '/test/test2' if file_exists cache_location + '/test/test2'
  fs.rmdirSync cache_location + '/test' if file_exists cache_location + '/test'
  
  assert.equal false, file_exists cache_location + '/index.html'
  
  http.get {host: 'localhost', port: 40008, path: '/'}, (response) ->
    assert.equal true, file_exists cache_location + '/index.html'
    response.on 'data', (data) ->
      assert.equal data.toString(), fs.readFileSync cache_location + '/index.html'
      
      http.get {host: 'localhost', port: 40008, path: '/text'}, (response) ->
        assert.equal false, file_exists cache_location + '/text.html'
        response.on 'data', (data) ->
          assert.match data.toString(), /<div>test<\/div>/
      
          #test TemplateView
          assert.equal false, file_exists cache_location + '/test/test2/test3/test4/test5/template.html'
          http.get {host: 'localhost', port: 40008, path: '/test/test2/test3/test4/test5/template'}, (response) ->
            assert.equal true, file_exists cache_location + '/test/test2/test3/test4/test5/template.html'
            response.on 'data', (data) ->
              assert.equal data.toString(), fs.readFileSync cache_location + '/test/test2/test3/test4/test5/template.html'
              #cleanup
              fs.unlinkSync cache_location + '/index.html'
              fs.unlinkSync cache_location + '/test/test2/test3/test4/test5/template.html'
              fs.rmdirSync cache_location + '/test/test2/test3/test4/test5'
              fs.rmdirSync cache_location + '/test/test2/test3/test4'
              fs.rmdirSync cache_location + '/test/test2/test3'
              fs.rmdirSync cache_location + '/test/test2'
              fs.rmdirSync cache_location + '/test'
              CachingViewServer.server.close()
              next()
              
module.exports.runServerTests = ->
  test_iterator = ->
    test = test_stack.shift()
    test test_iterator if test
  test_iterator()#TODO: use next() to unindent
