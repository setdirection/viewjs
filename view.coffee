constructor = -> ->
  if typeof @ is not 'function'
    @_initialize arguments[0]
    @initialize()
  else
    console.log @, @constructor, @prototype
    klass = View.clone()
    klass.extend.apply klass, arguments
    klass
    
View = constructor()
#console.log View

View.method = View.prototype.method = (method_name,callback) ->
  if arguments.length is 1
    for key, callback of method_name
      @[key] = callback
      @prototype[key] = callback if @prototype
  else
    @[method_name] = callback
    @prototype[method_name] = callback if @prototype

View.method extend: ->
  for argument in arguments
    for key, value of argument
      @method key, value if typeof value is 'function'
      
View.extend
  clone: ->
    klass = constructor()
    if @prototype
      for key of @prototype
        klass[key] = klass.prototype[key] = @prototype[key]
    else
      for key of @
        klass[key] = @[key]
    klass    
  _initialize: (arg) ->
    @arg = arg

exports = if module?.exports? then module.exports else window
exports.View = View