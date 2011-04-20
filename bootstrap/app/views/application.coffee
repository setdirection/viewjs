View.extend
  $: jQuery

View.create
  ApplicationView: [Router, Builder,
    render: ->
      @div @Router
  ]
      
$ -> View ApplicationView: ->
  $('body').empty().append @
  @initialize()