# Class & Mixin System
######################
ViewServer =
  extend: ->
    @extend.api ||= {}
    @mixin ||= []
    process_item = (key,value) ->
      should_add = true
      discard = ->
        should_add = false
      if key is 'extend'
        for _key of value
          @extend.api[_key] = value[_key]
      else
        if @extend.api[key]
          @extend.api[key].apply @, [value,discard]
        else
          @[key] = value
      if should_add
        @mixin.push [key,value]
    for argument in arguments
      if argument
        if argument.mixin?
          for item in argument.mixin
            process_item.apply @, item
        else
          for key, value of argument
            process_item.apply @, [key,value]

ViewServer.extend
  create: ->
    #anon view
    if arguments.length is 0 or (arguments.length is 1 and typeof arguments[0] is 'function')
      instance = @clone()
      instance.element()
      arguments[0].call instance if arguments[0]
      return instance
    #named view
    created_servers = {}
    for class_name, mixins of arguments[0]
      @trigger 'warning', class_name + ' already exists, overwriting.' if ViewServerManager.servers[class_name]?
      ViewServerManager.servers[class_name] = created_servers[class_name] = @clone()
      ViewServerManager.servers[class_name].name = class_name
      #process mixins passed to create()
      if is_array mixins
        created_servers[class_name].extend mixin for mixin in mixins
      else
        created_servers[class_name].extend mixins
      if deffered[class_name]?
        callback.call created_servers[class_name] while callback = deffered[class_name].pop() 
    created_servers

  clone: ->
    klass = {}
    klass.extend = @extend
    klass.extend.api = {}
    klass._callbacks = {}
    klass.extend @
    klass