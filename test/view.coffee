test 'Class and inheritance', ->
  # anon view
  instance = new View false,
    echo: (b) ->
      @a + b
  instance.a = 'a'
  equal instance.echo('b'), 'ab'
  # class
  ViewA = View
    c: 'c'
    echo: (b) ->
      @a + b
  instance = new ViewA
  instance.a = 'a'
  equal instance.echo('b'), 'ab'
    
  # subclass
  ViewB = View ViewA,
    echo: (_b) ->
      '1' + ViewA::echo.call(@, _b) + @c
  
  instance = new ViewB
  instance.a = 'a'
  equal instance.echo('b'), '1abc'
  
  instance = new ViewA
  instance.a = 'a'
  
  notEqual ViewA::echo, ViewB::echo
  equal instance.echo('b'), 'ab'  
  
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
  ,
    before:
      echo: (args,next) ->
        next args[0].toUpperCase(), ''
    
  instance = new ViewWithBefore
  equal instance.echo('a', 'b'), 'A'
  ViewWithBefore2 = View ViewWithBefore
  instance = new ViewWithBefore2
  equal instance.echo('a', 'b'), 'A'
  
test 'Render method and builder', ->
  # render as argument to extend
  instance = new View false,
    $: jQuery
    render: -> @div class: 'test'
  
  instance2 = new View false,
    $: jQuery
    render: ['html','<div class="test2"></div>']
  
  instance3 = new View false,
    $: jQuery
    render: -> ['html','<div class="test3"></div>']
  
  equal instance[0].className, 'test'
  equal instance2[0].className, 'test2'
  equal instance3[0].className, 'test3'
  
  # html render
  v = new View false
  node = v.render html: '<b>test</b>'
  node2 = v.render 'html', '<b>test2</b>'
  node3 = v.render -> ['html','<b>test3</b>']
  node4 = v.render -> @b 'test4'
  
  equal node.innerHTML, 'test'
  equal node2.innerHTML, 'test2'
  equal node3.innerHTML, 'test3'
  equal node4.innerHTML, 'test4'
  
  # html render with jQuery
  v = new View false,
    $: jQuery
  node = v.render html: '<b>test</b>'
  node2 = v.render 'html', '<b>test2</b>'
  node3 = v.render -> ['html','<b>test3</b>']
  node4 = v.render -> @b 'test4'
  
  equal node.html(), 'test'
  equal node2.html(), 'test2'
  equal node3.html(), 'test3'
  equal node4.html(), 'test4'
  
  # render returns jQuery object
  instance = new View false,
    render: -> jQuery @div 'test'
  equal jQuery(instance)[0].innerHTML, 'test'
  
  # deep test of builder
  instance = new View false,
    $: jQuery
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
                        @li 'value', class: 'test'
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
  equal instance.$().firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue, 'test'
  equal instance.$('li.test').html(), 'value'
  