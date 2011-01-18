# Port of an example Backbone application contributed by
# [JÃ©rÃ´me Gravel-Niquet](http://jgn.me/) to CoffeeScript
# and jQuery View.
# 
# This demo uses a simple
# [LocalStorage adapter](backbone-localstorage.html)
# to persist Backbone models within your browser.
#
# Load the application once the DOM is ready, using `jQuery.ready`:
$ ->

  # Todo Model
  # ----------

  # Our basic **Todo** model has `content`, `order`, and `done` attributes.
  Todo = Backbone.Model.extend
  
    # If you don't provide a todo, one will be provided for you.
    EMPTY: 'empty todo...'
    
    # Ensure that each todo created has `content`.
    initialize: ->
      @set(content: @EMPTY) if !@get('content')
      
    # Toggle the `done` state of this todo item.
    toggle: ->
      @save(done: !@get 'done')
      
    # Remove this Todo from *localStorage* and delete its view.
    clear: ->
      @destroy()
      @view.remove()

  # Todo Collection
  # ---------------

  # The collection of todos is backed by *localStorage* instead of a remote
  # server.
  TodoList = Backbone.Collection.extend
    # Reference to this collection's model.
    model: Todo
    
    # Save all of the todo items under the `"todos"` namespace.
    localStorage: new Store "todos"
    
    # Filter down the list of all todo items that are finished.
    done: ->
      @filter (todo) -> todo.get 'done'
      
    # Filter down the list to only todo items that are still not finished.
    remaining: ->
      @without.apply @, @done()
      
    # We keep the Todos in sequential order, despite being saved by unordered
    # GUID in the database. This generates the next order number for new items.
    nextOrder: ->
      return 1 if !@length
      @last().get('order') + 1
      
    # Todos are sorted by their original insertion order.
    comparator: (todo) ->
      todo.get 'order'

  # Create our global collection of **Todos**.
  Todos = new TodoList

  # Todo Item View
  # --------------
  TodoView = $.view
    initialize: ->
      # The TodoView listens for changes to its model, re-rendering. Since there's
      # a one-to-one correspondence between a **Todo** and a **TodoView** in this
      # app, we set a direct reference on the model for convenience.
      @model = @get 'model'
      @model.view = @
      @model.bind 'change', @render
      @ready @render
      # Build and return the DOM element for the Todo item, storing references to
      # elements that are needed later
      @li(
        @todoElement = @div(className: 'todo',
          @div(className: 'display',
            $(@input className: 'check', type: 'checkbox', checked: @model.get 'done').click @toggleDone
            @contentElement = $(@div className: 'todo-content').dblclick @edit
            $(@div className: 'todo-destroy').click @clear
          )
          @div(className: 'edit',
            @inputElement = $(@input className: 'todo-input', type: 'text', value: '').bind(
              keypress: @updateOnEnter
              blur: @close
            )
          )
        )
      )
      
    #Toggle the `"done"` state of the model.
    toggleDone: ->
      @model.toggle()
      
    # Switch this view into `"editing"` mode, displaying the input field.
    edit: ->
      @$.addClass 'editing'
      @inputElement.focus()
      
    #Remove the item, destroy the model.
    clear: ->
      @model.clear()
      
    # If you hit `enter`, we're through editing the item.
    updateOnEnter: (e) ->
      @close() if e.keyCode == 13
      
    # Close the `"editing"` mode, saving changes to the todo.
    close: ->
      @model.save content: @inputElement.val()
      @$.removeClass 'editing'
      
    # Remove this view from the DOM.
    remove: ->
      @$.remove()
      
    # To avoid XSS (not that it would be harmful in this particular app),
    # we use `jQuery.text` to set the contents of the todo item.
    render: ->
      content = @model.get('content')
      @contentElement.text content
      @inputElement.val content
      $(@todoElement)[if @model.get 'done' then 'addClass' else 'removeClass']('done')

  # The Application
  # ---------------

  # Our overall **AppView** is the top-level piece of UI.
  AppView = $.view
    template: """
    <div id="todoapp">
      <div class="title">
        <h1>Todos</h1>
      </div>
      <div class="content">
        <div id="create-todo">
          <input id="new-todo" placeholder="What needs to be done?" type="text" />
          <span class="ui-tooltip-top" style="display:none;">Press Enter to save this task</span>
        </div>
        <div id="todos">
          <ul id="todo-list"></ul>
        </div>
        <div id="todo-stats"></div>
      </div>
    </div>
    """
    
    initialize: ->
      # Attach event handlers and store references
      @inputElement = @$("#new-todo").bind(
        keypress: @createOnEnter
        keyup: @showTooltip
      )
      @statsElement = @$ '#todo-stats'
      @listElement = @$ '#todo-list'
      @tooltipElement = @$ '.ui-tooltip-top'
      
      # At initialization we bind to the relevant events on the `Todos`
      # collection, when items are added or changed. Kick things off by
      # loading any preexisting todos that might be saved in *localStorage*.
      Todos.bind 'add', @addOne
      Todos.bind 'refresh', @addAll
      Todos.bind 'all', @render
      Todos.fetch()
      
    # Re-rendering the App just means refreshing the statistics -- the rest
    # of the app doesn't change.
    render: ->
      @total = Todos.length
      @done = Todos.done().length
      @remaining = Todos.remaining().length
      @statsElement.empty()
      if @total
        @statsElement.append(
          @span(className: 'todo-count',
            @span @remaining, className: 'number'
            @span (if @remaining is 1 then ' item ' else ' items '), className: 'word'
            'left.'
          )
        )
      if @done
        @statsElement.append(
          $(@span(className: 'todo-clear',
            @a(href:'#',
              'Clear '
              @span @done, className: 'number-done'
              ' completed '
              @span (if @done is 1 then 'item' else 'items'), className: 'word-done'
            )
          )).click @clearCompleted
        )

    # Add a single todo item to the list by creating a view for it, and
    # appending its element to the `<ul>`.
    addOne: (todo) ->
      @listElement.append new TodoView model: todo
      
    # Add all items in the **Todos** collection at once.
    addAll: ->
      Todos.each @addOne
      
    # Generate the attributes for a new Todo item.
    newAttributes: ->
      content: @inputElement.val()
      order: Todos.nextOrder()
      done: false

    # If you hit return in the main input field, create new **Todo** model,
    # persisting it to *localStorage*.
    createOnEnter: (e) ->
      return if e.keyCode isnt 13
      Todos.create @newAttributes()
      @inputElement.val ''
      
    # Clear all done todo items, destroying their models.
    clearCompleted: ->
      @map Todos.done(), (todo) -> todo.clear()
      false

    # Lazily show the tooltip that tells you to press `enter` to save
    # a new todo item, after one second.
    showTooltip: (e) ->
      value = @inputElement.val()
      @tooltipElement.fadeOut()
      clearTimeout(@tooltipTimeout) if @tooltipTimeout
      return if value == '' || value is @inputElement.attr 'placeholder'
      @tooltipTimeout = setTimeout =>
        @tooltipElement.show().fadeIn()
      ,1000

  $(new AppView().element()).appendTo('#app');