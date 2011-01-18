jQuery View
===========
Markup as JavaScript **[Development](https://github.com/syntacticx/viewjs/zipball/master) | [Production (6KB)](https://github.com/syntacticx/viewjs/raw/master/jquery.view.min.js)**  

<ul id="nav">
  <li><a href="#intro">Intro</a></li>
  <li><a href="#guide">Guide</a></li>
  <li><a href="#api">API</a></li>
  <li><a href="#examples">Examples</a></li>
</ul>
<br class="clear"/>

A class and inheritance system for templates which can be constructed with a mix of pure JavaScript, HTML strings, jQuery templates and jQuery objects:

    ListView = $.view(function(){
      return this.ul( //pure JavaScript
        "<li>Item One</li>", //HTML strings
        "<li>${key}</li>", //jQuery Templates
        $(this.li('Item Three')).click(this.handleClick) //inline jQuery
      );
    },{
      //methods are auto proxied, "this" is always the view
      handleClick: function(event){}
    });
    //use views as arguments to jQuery
    var instance = new ListView({key:'Item Two'});
    $(instance).appendTo('body');

Works Well With
---------------
- [jQuery Routes](http://routesjs.com/)
- [Backbone.js](http://documentcloud.github.com/backbone/) for models and collections

Copyright 2011 [Syntacticx](http://syntacticx.com/). Released under the [MIT or GPL License](http://jquery.org/license).  
Thanks to [\_why](http://www.youtube.com/watch?v=lwDDa9ctNFE) for [Markaby](http://markaby.github.com/). 

Class Creation
--------------

Use $.view to create a new View class. $.view takes two arguments, a constructor function that must return a DOM element or HTML string,
and an optional hash of instance methods.

    MyView = $.view(function(){
      return this.div();
    },{
      methodName: function(){}
    });

The constructor may also be specified as "initialize":

    MyView = $.view({
      initialize: function(){
        return this.div();
      }
    });

The element returned by the constructor is available via the **element** method. Passing a View
instance to jQuery is the same as passing the View's element to jQuery.

    var instance = new MyView();
    instance.element().tagName == 'DIV';
    $(instance).appendTo(document.body);

All instance methods specified are automatically proxied, so you can pass an instance method
as an event handler and "this" will still refer to the view instance.

    $('<a href="#">My Link</a>').click(this.handleClick);

A View class may optionally attach to an Element that is already
on the page, in which case the constructor must always be called
with an Element:

    MyView = $.view(function(element){});
    new MyView($('#my_div'),{key:'value'});

### Attributes
View classes take only one argument when creating a new instance: an optional hash of attributes.
Attributes are accessed using **get**, **set**, and **attributes** which will return a plain
hash of the View's attributes.

    var instance = new MyView({
      key: 'value'
    });
    instance.get('key');
    instance.attributes();

### Subclasses

Views can be subclassed by passing a View class as the first argument to **$.view**. The constructor
will receive the parent's element as the only argument. The constructor does not need to return
an element since the parent's constructor has already generated it. Any events bound to the parent
class will be triggered on the child class.

    MyViewSubclass = $.view(MyView,function(element){
      $(element).addClass('two');
      this.ready(function(){
        //do something special only in this subclass
      });
    },{
      childMethod: function(){}
    });

A subclass constructor may **optionally** return an element. In this case the subclass
will return the parent's p tag wrapped in a div.

    ParagraphView = $.view(function(){
      return this.p(this.get('text'));
    });

    EnhancedParagraphView = $.view(ParagraphView,function(element){
      return this.div({className:'enhanced'},element);
    });

### Singletons

View classes implement a variant of the [Singleton pattern](http://en.wikipedia.org/wiki/Singleton_pattern)
with the **instance** method. This method will return the same instance of a view every time it is called,
or will create it if **instance** is being called for the first time on that class.

    var instance = MyView.instance();

Builder
-------

All HTML tag names are available as methods inside of View classes. Each view method takes a variable number of arguments which can be passed in any order and returns a DOM element. Possible arguments are:

A hash of HTML attributes:

    this.a({href:'#',className:'my_link'});

A string:

    this.p('Paragraph text.');

DOM Elements:

    this.ul({className:'my_list'},
      this.li('Item One')
      this.li(this.b('Bold List Item Two'))
    );

HTML strings can be mixed and matched:

    this.form(
      '<p class="label">Author</p>',
      this.input({name:'author',type:'text'}),
      this.p({className:'label'},'Body <b>Required</b>'),
      '<textarea name="body"></textarea>'
    );

Templates will be rendered with the view's attributes and methods:

    MyView = $.view(function(){
      this.set('key','value');
      this.ul(
        '<li>${key}</li>'
      );
    });

jQuery objects can be used. Any instance methods defined by the class will automatically be proxied, so "this" will always refer to the view instance if passed to an event handler.

    MyView = $.view(function(){
      return this.ul(
        this.li(
          $(this.a({href:'#'},'My Link')).click(this.handleClick)
        )
      );
    },{
      handleClick: function(event){
        //this == MyView instance
        var element = event.target;
        return false;
      }
    });

Methods will be called:

    this.ul(this.generateListItems);

View classes and view instances:

    this.ul(
      this.li('Item Two'),
      ListItemView, //will be initialized with no attributes
      new ListItemView({name:'Item Three'})
    );

An array (which will be flattened) of any of the above can be used as well:

    this.ul(
      this.li('Item One'),
      [
        this.li('Item Two'),
        this.li('Item Three'),
        [
          this.li('Item Four')
        ]
      ]
    );

The **map** method returns an Array and is designed to be used with builder methods. It accepts an array or object. "this" will always refer to the view instance inside of the iterator.

    this.ul(
      this.map(['One','Two','Three'],function(item,i){
        return this.li('Item ' + item);
      })
    );

    this.ul(
      this.map({
        'jQuery': 'http://jquery.com/',
        'NodeJS': 'http://nodejs.org/'
      },function(key,value){
        return this.li(this.a({href:value},key));
      })
    );

Builder methods are also available in the **$.view** object if builder
methods are needed outside of view classes:

    MyView.classMethod = function(){
      return $.view.div();
    };

References to elements can be assigned as you build your elements. This saves
writing a query to find a particular element you need later.

    this.ul(
      this.listItemOne = this.li(),
      this.li()
    );
    $(this.listItemOne).click(this.clickHandler);

Events
------
Each View class has the same event method names as jQuery: **bind**, **unbind**, **one**, **trigger**.
View events are not DOM events, there is no event object and an arbitrary number of arguments
can be passed to event handlers. Events should be the primary way multiple View's communicate with
each other.

Events are created with the **trigger** method. All arguments passed to trigger are passed
to any registered event handlers. If any event handler returns false, the call to
**trigger** will return false. Otherwise it will return an array of responses from the handlers.
    
    this.trigger('event_name',a,b);

Events can be observed on all instances of a class. Handlers will receive the instance that
triggered the event followed by any arguments passed in the event.

    MyView.bind('event_name',function(instance,a,b){
    
    });

View's **bind** method accepts an optional context parameter.
Any arguments after that will be curried onto the handler.

    this.bind('event_name',function(c,a,b){
      this == context;
    },context,c);

View classes have two built in events. The **ready** event is triggered when the View's element has been attached to the DOM.
It can be accessed by the **ready** method or by calling **bind('ready',handler)**.

    MyView = $.view(function(){
      this.ready(function(){
        this.nameInput.focus();
      });
      return this.form(
        this.p({className:'label','Name'}),
        this.nameInput = this.input({type:'text'})
      );
    });

The **change** event is triggered whenever attributes in the view have been changed.

    MyView.bind('change',function(instance,changed_attributes){
      for(var key in changed_attributes){
        
      }
    });

 
