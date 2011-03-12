# Logger
########
Logger = 
  log: (method_name) ->
    execute = (method_name) ->
      @before method_name, (next,args...) ->
        response = next.apply @, args
        console.log "#{@name}.#{method_name}", array_from(args), ' -> ', response
        response
    if is_array method_name
      execute.call @, _method_name for _method_name in method_name
    else
      execute.call @, method_name
  extend:
    log: (method_name) ->
      @log method_name
