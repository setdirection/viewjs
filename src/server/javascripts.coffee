# JavaScripts
#############
  
ViewServer.extend javascripts: ->
  process_script_arguments arguments, @_javascripts

ViewServer.extend extend:javascripts: (javascripts) ->
  @javascripts javascripts

ViewServer.extend execute: ->
  process_script_arguments arguments, @_execute

ViewServer.extend extend:execute: (executables) ->
  @execute executables
  
process_script_arguments = (args,target) ->
  target ||= []
  add_script = (script) =>
    target.push script if not (script in target)
  for script in array_flatten array_from args
    if script.match /^https?\:/
      add_script script
    else if is_directory script
      files_with_extension(script, /\.js$/).map add_script
    else
      add_script script
  