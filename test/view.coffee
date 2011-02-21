test 'Class and inheritance', ->
  # anon view
  console.log 'a'
  instance = new View false,
    echo: (b) ->
      @a + b
  console.log 'b'
  instance.a = 'a'
  equal instance.echo('b'), 'ab'
  console.log 'c'
  # class
  ViewA = View
    c: 'c'
    echo: (b) ->
      @a + b
  console.log 'ViewA', ViewA
  instance = new ViewA
  instance.a = 'a'
  equal instance.echo('b'), 'ab'
    
  # subclass
  console.log 'build ViewB'
  console.log '-----------'
  ViewB = View ViewA,
    echo: (_b) ->
      '1' + ViewA::echo.call(@, _b) + @c
  console.log '-----------'    
  console.log 'built ViewB'
  
  instance = new ViewB
  instance.a = 'a'
  equal instance.echo('b'), '1abc'
  
  instance = new ViewA
  instance.a = 'a'
  
  notEqual ViewA::echo, ViewB::echo
  equal instance.echo('b'), 'ab'  

  #
  #console.log 'a'
  #AppView = View
  #  initialize: ->
  #    @a = 'a'
  ##console.log 'b'
  #anon = new View
  #  initialize: ->
  #    @b = 'b'
  #console.log 'c'
  #instance = new AppView
  #  initialize: ->
  #    @b = 'b'
  #console.log 'd'
  
test 'before and after', ->
  v = new View false,
    echo: (a,b) ->
      a + b
  equal v.echo('a','b'), 'ab'
  v.before echo: (args,next) ->
    next args[0] + args[0], args[1] + args[1]
  equal v.echo('a','b'), 'aabb'
  v.before echo: (args,next) ->
    #empty call to next
    args[0] = args[0].toUpperCase()
    args[1] = args[1].toUpperCase()
    next()
  equal v.echo('a','b'), 'AABB'
  
  #with subclass
  ViewWithBefore = View
    echo: (a,b) ->
      a + b
  ViewWithBefore.before echo: (args,next) ->
    next args[0].toUpperCase(), ''
  instance = new ViewWithBefore
  equal instance.echo('a', 'b'), 'A'
  ViewWithBefore2 = View ViewWithBefore
  instance = new ViewWithBefore2
  equal instance.echo('a', 'b'), 'A'
  
test 'Render method and builder', ->
  # render as argument to extend
  instance = new View
    $: jQuery
    render: -> @div class: 'test'
  
  instance2 = new View
    $: jQuery
    render: ['html','<div class="test"></div>']
  
  instance3 = new View
    $: jQuery
    render: -> ['html','<div class="test"></div>']
  
  equal instance.$[0].className, 'test'
  equal instance2.$[0].className, 'test'
  equal instance3.$[0].className, 'test'
  
  # html render
  v = new View
  node = v.render html: '<b>test</b>'
  node2 = v.render 'html', '<b>test</b>'
  node3 = v.render -> ['html','<b>test</b>']
  node4 = v.render -> @b 'test'
  
  equal node.innerHTML, 'test'
  equal node2.innerHTML, 'test'
  equal node3.innerHTML, 'test'
  equal node4.innerHTML, 'test'
  
  # html render with jQuery
  v = new View
    $: jQuery
  node = v.render html: '<b>test</b>'
  node2 = v.render 'html', '<b>test</b>'
  node3 = v.render -> ['html','<b>test</b>']
  node4 = v.render -> @b 'test'
  
  equal node.html(), 'test'
  equal node2.html(), 'test'
  equal node3.html(), 'test'
  equal node4.html(), 'test'
  
  # render returns jQuery object
  instance = new View
    render: -> jQuery @div 'test'
  equal jQuery(instance)[0].innerHTML, 'test'
  
  # deep test of builder
  instance = new View
    render: ->
      @div(
        @table(
          @tbody(
            @tr(
              @td(
                @ul(
                  @li @span @b 'test'
                  @li()
                  [
                    @li()
                    [
                      @li()
                      @li()
                      [
                        @li class: 'test', 'value'
                      ]
                    ]
                  ]
                )
              )
              @td @p @span 'test'
            )
            @tr(
              @td()
              @td()
            )
          )
        )
      )
  equal instance.$[0].firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue, 'test'
  equal instance.$('li.test').html(), 'value'
  