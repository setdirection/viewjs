# JavaScripts
#############
  
ViewServer.extend javascripts: ->
  @_javascripts ||= []
  return @_javascripts if arguments.length is 0
  @_javascripts.push array_from arguments

ViewServer.extend extend:javascripts: (javascripts) ->
  @javascripts javascripts

ViewServer.extend execute: ->
  @_execute ||= []
  return @_execute if arguments.length is 0
  @_execute.push array_from arguments

ViewServer.extend extend:execute: (executables) ->
  @execute executables

ViewServer.extend stylesheets: (stylesheets) ->
  @_stylesheets ||= []
  return @_stylesheets if arguments.length is 0
  @_stylesheets.push array_from arguments

ViewServer.extend extend:stylesheets: (stylesheets) ->
  @stylesheets stylesheets