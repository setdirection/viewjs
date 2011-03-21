# Class & Mixin System
######################  
View =
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
      if not is_view(argument) and typeof argument is 'function' and not argument.mixin?
        @bind 'ready', argument
      else if argument
        if argument.mixin?
          for item in argument.mixin
            process_item.apply @, item
        else
          for key, value of argument
            process_item.apply @, [key,value]

View.extend
  stack: (commands) ->
    @_stack ||= {}
    for method_name of commands
      if not @[method_name]
        @_stack[method_name] =
          complete: ->
          stack: []
        @[method_name] = ->
          _stack = array_from @_stack[method_name].stack
          step = ->
            (_stack.shift() || @_stack[method_name].complete).apply @, array_from(arguments).concat [proxy(step, @)]
          step.apply @, array_from arguments
      for command_name, callback of commands[method_name]
        switch command_name
          when 'complete' then @_stack[method_name].complete = callback
          when 'add' then @_stack[method_name].stack.push callback
          when 'clear' then @_stack[method_name].stack = []

View.extend extend:stack: (commands) ->
  @stack commands

View.extend
  create: ->
    #anon view
    if arguments.length is 0 or (arguments.length is 1 and typeof arguments[0] is 'function')
      instance = @clone()
      instance.element()
      arguments[0].call instance if arguments[0]
      return instance
    #named view
    created_views = {}
    for class_name, mixins of arguments[0]
      @trigger 'warning', class_name + ' already exists, overwriting.' if ViewManager.views[class_name]?
      ViewManager.views[class_name] = created_views[class_name] = @clone()
      ViewManager.views[class_name].name = class_name
      #process mixins passed to create()
      if is_array mixins
        created_views[class_name].extend mixin for mixin in mixins
      else
        created_views[class_name].extend mixins
      created_views[class_name].element()
      if deffered[class_name]?
        callback.call created_views[class_name] while callback = deffered[class_name].pop() 
    created_views
    
  clone: ->
    klass = {}
    klass.extend = @extend
    klass.extend.api = {}
    klass.attributes = {}
    klass._changed = false
    klass._ready = false
    klass._callbacks = {}
    klass.extend @    
    klass
