{ViewServer} = require 'view'
express = require 'express'

public = __dirname + '/public/'
templates = __dirname + '/templates/'

{ApplicationServer} = ViewServer.create ApplicationServer:
  port: 3000
  public: public
  templates: templates
  stylesheets: public + 'stylesheets'
  javascripts: [
    "#{public}javascripts/lib/jquery.js"
    "#{public}javascripts/lib/underscore.js"
    "#{public}javascripts/lib/backbone.js"
    "#{public}javascripts/lib/view.js"
    "#{public}javascripts/templates.js"
    "#{public}javascripts/models"
    "#{public}javascripts/views/application.js"
    "#{public}javascripts/views"
  ]
  routes: 
    '/': 'IndexView'
      
ApplicationServer.env set:
  production: ->
    false #your config here
  development: ->
    true #your config here

# setup express
ApplicationServer.env
  production: ->
    @server.use express.errorHandler()
    @server.use express.session
      secret: 'production secret'
  development: ->
    @server.use express.errorHandler
      dumpExceptions: true
      showStack: true
    @server.use express.session
      secret: 'dev secret'