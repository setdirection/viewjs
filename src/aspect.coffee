# Metaprogramming
#################
View.extend
  before: (methods) ->
    if arguments.length is 2
      _methods = {}
      _methods[arguments[0]] = arguments[1]
    else
      _methods = methods
    for method_name, method of _methods
      @[method_name] = wrap_function @[method_name], method

View.extend extend:before: (methods) ->
  @before methods