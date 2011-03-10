Create named views:

    {ApplicationView} = View.create ApplicationView:
      render: 'application.eco'

Find views later:

    [ApplicationView] = View 'ApplicationView'

Name, callback pairs passed to View are executed with the view as the scope. Initialize must be called before a view is rendered, and views can be passed as arguments to jQuery. The 'ready' event is fired when initialize is complete and the view has been rendered.

    View ApplicationView: ->
      @ready -> $('body').append @
      @initialize()
      
Views can be extended with mixins (just plain old objects):

    ApplicationView.extend
      $: jQuery

The builder library is an available mixin, which adds all HTML tags as methods:
    
    ApplicationView.extend Builder
    
Subclasses are created with the "create" keyword as well:

    {SubApplicationView} = ApplicationView.create SubApplicationView:
      render: ->
        @div 'test'

Create anonymous clones (most similar to using "new"):

    {PostView} = View.create PostView:
      render: 'post.eco'
    
    one = PostView.create()
    two = PostView.create()
      
Initialize can contain asynchronous logic. Interally @render() is called after initialize finishes. Render can be a template filename, or a function that will return a DOM element. If a View has a collection, render will be called once for each item in the collection.

    View.create PostCollectionView: [Builder,
      collection: PostCollection
      initialize: (next) ->
        @collection.fetch success: next
      render: (item) ->
        @div 'post item'
    ]

Dependent views become properties of the view that depends on them, initialize will not finish until child views are ready:

    {LayoutView} = View.create LayoutView: [Builder,
      views: ['MainColumnView','SidebarView']
      render: ->
        @div class: 'main',
          @MainColumnView
          @SidebarView
    ]

Create custom rules to process mixins:

    View.extend extend:custom: (value) ->
      #called each time the "custom" key is encountered in a mixin

    View.create MyView:
      custom: 'some value'

AOP as part of a mixin:

    Animate = 
      before:
        open: (next) ->
          @$.fadeIn 500, next
        close: (next) ->
          @$.fadeOut 500, next
    
    {AnimatingModalView} = ModalView.create
      AnimatingModalView: Animate