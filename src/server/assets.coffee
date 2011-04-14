# JavaScripts
#############
  
ViewServer.extend javascripts: ->
  @_javascripts ||= []
  @_javascripts.push array_from arguments

ViewServer.extend extend:javascripts: (javascripts) ->
  @javascripts javascripts

ViewServer.extend execute: ->
  @_execute ||= []
  @_execute.push array_from arguments

ViewServer.extend extend:execute: (executables) ->
  @execute executables

ViewServer.extend stylesheets: (stylesheets) ->
  @_stylesheets ||= []
  @_stylesheets.push array_from arguments

ViewServer.extend extend:stylesheets: (stylesheets) ->
  @stylesheets stylesheets