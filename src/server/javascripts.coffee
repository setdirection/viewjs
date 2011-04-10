# JavaScripts
#############
  
ViewServer.extend javascripts: (javascripts) ->
  @_javascripts ||= []
  add_script = (script) =>
    @_javascripts.push script if not (script in @_javascripts)
  scripts = array_flatten array_from arguments
  for script in javascripts
    if script.match /^https?\:/
      add_script script
    else if is_directory script
      files_with_extension(script, /\.js$/).map add_script
    else
      add_script script

ViewServer.extend extend:javascripts: (javascripts) ->
  @javascripts javascripts

ViewServer.extend execute: (executables) ->
  @_execute ||= []
  add_script = (script) =>
    @_execute.push script if not (script in @_execute)
  scripts = array_flatten array_from arguments
  for script in executables
    if script.match /^https?\:/
      add_script script
    else if is_directory script
      files_with_extension(script, /\.js$/).map add_script
    else
      add_script script

ViewServer.extend extend:execute: (executables) ->
  @execute executables