View.extend
  $: jQuery

View.create
  ApplicationView: [Router, Builder,
    render: ->
      @div @router
  ]
      
$ -> View ApplicationView: ->
  $('body').empty().append @
  @initialize()