#test
{ViewServer} = require './view.server.js'

module.exports.parses = ->
  assert.ok(true)

module.exports.canCreateBasicServer = ->
  {TestServer} = ViewServer.create TestServer:
    port: 99999
  assert.equal TestServer.server.connections, 0
  TestServer.server.close()

module.exports.serverCanRenderTemplate = ->
  View.create TemplateServerTestView:
    render: 'test.eco'
    
  {TemplateServer} = ViewServer.create TemplateServer:
    port: 99998
    templates: '../test/templates'
    routes:
      '/': 'TemplateServerTestView'
  
  console.log '!'
  console.log require('jsdom').version
  
  http.get {
    host: 'localhost'
    port: 99998
    path: '/'
  }, (response) ->
    #console.log response
    TemplateServer.server.close()
