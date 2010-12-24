var ArgumentsTestView = $.view(function(){
  return this.ul(
    this.li('one','two',this.b('three'),'four',this.b('five')),
    this.li({className: 'test'}),
    {className: 'blarg'}
  );
});

var DeepView = $.view(function(){
  return this.div(
    this.table(
      this.tbody(
        this.tr(
          this.td(
            this.ul(
              this.li(this.span(this.b('test'))),
              this.li()
            )
          ),
          this.td(
            this.p(this.span('test'))
          )
        ),
        this.tr(
          this.td(
            
          ),
          this.td(
            
          )
        )
      )
    )
  );
});

var ViewWithJQuery = $.view(function(){
  var element = this.ul({id:'jquery_test'},
    this.li('a'),
    $(this.li('b')),
    $(this.li('c')).addClass('test').attr('id','test2')
  );
  return element;
});

test("Node creation with mix and match of text and elements",function(){
  var arguments_instance = new ArgumentsTestView();
  equal(arguments_instance.element().firstChild.firstChild.nodeValue,'one');
  equal(arguments_instance.element().firstChild.childNodes[2].tagName,'B');
});

test("Node creation with jQuery methods being chained in builder",function(){
  var jquery_view_instance = new ViewWithJQuery();
  var list_items = $('li',jquery_view_instance.element());
  equal(list_items.length,3);
  equal(list_items[1].innerHTML,'b');
  equal(list_items[2].innerHTML,'c');
  equal(list_items[2].className,'test');
  equal(list_items[2].id,'test2');
});

test("View instance can be used as argument to jQuery",function(){
  var instance = new ViewWithJQuery();
  $(instance).appendTo(document.body);
  equal($('#jquery_test').length,1);
  $(instance).detach();
  equal($('#jquery_test').length,0);
  equal($('li',instance).length,3);
});

test("Constructor can return a jQuery object",function(){
  var TestView = $.view(function(){
    return $(this.div('test'));
  });
  equal(new TestView().element().innerHTML,'test');
});

test("Node creation with deep nesting",function(){
  var deep_instance = new DeepView();
  equal(deep_instance.element().firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue,'test');
});

test("User specified view methods are proxied",function(){
  var test_value;
  var event_test;
  var ProxyTestView = $.view(function(){
    this.testValue = 'test';
    return $(this.div()).click(this.clickHandler);
  },{
    clickHandler: function(event){
      event_test = event;
      test_value = this.testValue;
    }
  });
  var instance = new ProxyTestView();
  $(instance.element()).trigger('click');
  equal(test_value,'test');
});

var trigger_count = 0;
var ParentView = $.view(function(){
  return this.span();
});
ParentView.className = 'ParentView.Class';
ParentView.prototype.className = 'ParentView.Instnace';
var ChildView = $.view(ParentView,function(parent_element){
  return parent_element;
});

ChildView.className = 'ChildView.Class';
ChildView.prototype.className = 'ChildView.Instnace';
test('ready event firing on class, instance and after ready',function(){
  ParentView.ready(function(){
    ++trigger_count;
  });
  var parent_instance = new ParentView();
  parent_instance.ready(function(){
    ++trigger_count;
  });
  document.body.appendChild(parent_instance.element());
  parent_instance.bind('ready',function(){
    ++trigger_count;
  });
  equal(trigger_count,3);
});
test('ready event cascades to child class',function(){
  //observing "ready" immediately after inserting will syncrhonusly trigger other observers that had been delayed
  child_instance = new ChildView();
  document.body.appendChild(child_instance.element());
  child_instance.bind('ready',function(){
    ++trigger_count;
  });
  equal(trigger_count,5);
});

var ParentViewTwo = $.view(function(){
  this.set('a','1');
  this.textNode = this.span();
  this.setText(this.get('value'));
  this.trigger('parent_event','a');
  return this.textNode;
},{
  setText: function(text){
    this.trigger('text',text);
    this.textNode.innerHTML = text;
  },
  getText: function(){
    return this.textNode.innerHTML;
  },
  parentTrigger: function(){
	  this.trigger('parent_trigger_event','a');
  }
});
ParentViewTwo.className = 'ParentView.Class';
ParentViewTwo.prototype.className = 'ParentView.Instnace';

var ChildViewTwo = $.view(ParentViewTwo,function(parent_element){
  this.set('b',2);
  parent_element.className = 'added';
  this.trigger('child_event','b');
  return parent_element;
},{
  childTrigger: function(){
    this.trigger('child_trigger_event','b');
  }
});
ChildViewTwo.className = 'ChildView.Class';
ChildViewTwo.prototype.className = 'ChildView.Instnace';

test('List of methods to proxy correctly cascades',function(){
  var parent = new ParentViewTwo();
  var child = new ChildViewTwo();
  equal(parent.constructor.methodsToProxy.length,'3');
  equal(child.constructor.methodsToProxy.length,'4');
});

test('View subclass attributes cascades to child',function(){
  var child = new ChildViewTwo({value:'test'});
  equal(child.get('a'),1);
  equal(child.get('b'),2);
});

test('Parent element passed to child constructor',function(){
  var child = new ChildViewTwo({value:'test'});
  document.body.appendChild(child.element());
  equal(child.getText(),'test');
  equal(child.textNode.className,'added');
  $(child.element()).detach();
});

test('Events triggered and cascade properly between parent and child',function(){
  var child = new ChildViewTwo({value:'test'});
  var notify_arg_from_parent;
  var notify_arg_from_child;
  var trigger_count = 0;
  child.bind('parent_trigger_event',function(){
    ++trigger_count;
    notify_arg_from_parent = arguments[0];
  });
  child.bind('child_trigger_event',function(){
    ++trigger_count;
    notify_arg_from_child = arguments[0];
  });
  child.parentTrigger();
  child.childTrigger();
  equal(trigger_count,2);
  equal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');
  notify_arg_from_parent = false;
  notify_arg_from_child = false;
  ChildViewTwo.bind('parent_event',function(){
    ++trigger_count;
    notify_arg_from_parent = arguments[1];
  });
  ChildViewTwo.bind('child_event',function(){
    ++trigger_count;
    notify_arg_from_child = arguments[1];
  });
  new ChildViewTwo({value: 'test'});
  equal(trigger_count,4);
  equal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');

  var notify_arg_from_parent_class;
  notify_arg_from_parent = false;
  notify_arg_from_child = false;
  ParentViewTwo.bind('parent_event',function(){
    ++trigger_count;
    notify_arg_from_parent_class = arguments[1];
  });
  new ChildViewTwo({value: 'test'});
  equal(trigger_count,7);
  equal(notify_arg_from_parent_class,'a');
  equal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');

  notify_arg_from_parent_class = false;
  notify_arg_from_parent = false;
  notify_arg_from_child = false;
  ChildViewTwo.unbind('parent_event');
  new ChildViewTwo({value: 'test'});
  equal(trigger_count,8);
  equal(notify_arg_from_parent_class,false);
  equal(notify_arg_from_parent,false);
  equal(notify_arg_from_child,'b');
  new ParentViewTwo({value: 'test'});
  equal(trigger_count,9);
  equal(notify_arg_from_parent_class,'a');
});

//routes tests
ViewWithRoutes = $.view(function(){
  return this.div();
},{
  article: function(params){
    this.lastParams = params;
  },
  articleComment: function(params){
    this.lastParams = params;
  },
  home: function(){

  },
  wiki: function(){},
  multipleParams: function(){},
  test: function(){},
  optionalOne: function(){},
  optionalTwo: function(){},
  optionalThree: function(){}
});

Deep = {
  Nested: {
    TestView: $.view(function(){
      return this.div();
    },{
      test: function(){
        Deep.Nested.TestView.wasCalled = true;
      }
    })
  }
};

$.routes({
  '/': 'ViewWithRoutes#home',
  '/article/:id': 'ViewWithRoutes#article',
  '/article/:id/:comment_id': 'ViewWithRoutes#articleComment',
  '/wiki/*': 'ViewWithRoutes#wiki',
  '/one/two/:three/:four/:five/:six': ViewWithRoutes.instance().multipleParams,
  '/one/:a/(:b)': 'ViewWithRoutes#optionalOne',
  '/one/:a/(:b)/(:c)': 'ViewWithRoutes#optionalTwo',
  '/one/:a/(:b)/(:c)/(:d)/(:e)': 'ViewWithRoutes#optionalThree',
  '/:ViewWithRoutes/:method/:id': 'ViewWithRoutes#test',
  '/nested_test/': 'Deep.Nested.TestView#test'
});

test('Url generation',function(){
  equal($.routes("url",'ViewWithRoutes#home'),'/');
  equal($.routes("url",'ViewWithRoutes#article',{id:'5'}),'/article/5');
  equal($.routes("url",'ViewWithRoutes#wiki','/one/two/three'),'/wiki/one/two/three');
  equal($.routes("url",'ViewWithRoutes#test',{
    ViewWithRoutes: 'contacts',
    method: 'create',
    id: 5
  }),'/contacts/create/5');
});

test('Routes matching',function(){
  equal($.routes('match','/')[0],ViewWithRoutes.instance().home);
  equal($.routes('match','/article/5')[0],ViewWithRoutes.instance().article);
  equal($.routes('match','/article/5')[1].id,"5");
  equal($.routes('match','/one/two/3/4/5/6')[0],ViewWithRoutes.instance().multipleParams);
  equal($.routes('match','/one/two/3/4/5/6')[1].three,"3");
  equal($.routes('match','/one/two/3/4/5/6')[1].four,"4");
  equal($.routes('match','/one/two/3/4/5/6')[1].five,"5");
  equal($.routes('match','/one/two/3/4/5/6')[1].six,"6");

  equal($.routes('match','/one/a/b')[0],ViewWithRoutes.instance().optionalOne);
  equal($.routes('match','/one/a/b')[1].a,'a');
  equal($.routes('match','/one/a/b')[1].b,'b');

  equal($.routes('match','/one/a/b/c')[0],ViewWithRoutes.instance().optionalTwo);
  equal($.routes('match','/one/a/b/c')[1].a,'a');
  equal($.routes('match','/one/a/b/c')[1].b,'b');
  equal($.routes('match','/one/a/b/c')[1].c,'c');

  equal($.routes('match','/one/a/b/c/d/e')[0],ViewWithRoutes.instance().optionalThree);
  equal($.routes('match','/one/a/b/c/d/e')[1].a,'a');
  equal($.routes('match','/one/a/b/c/d/e')[1].b,'b');
  equal($.routes('match','/one/a/b/c/d/e')[1].c,'c');
  equal($.routes('match','/one/a/b/c/d/e')[1].d,'d');
  equal($.routes('match','/one/a/b/c/d/e')[1].e,'e');
  equal($.routes('match','/one/a/b/c/d')[0],ViewWithRoutes.instance().optionalThree);
  equal($.routes('match','/one/a/b/c/d')[1].a,'a');
  equal($.routes('match','/one/a/b/c/d')[1].b,'b');
  equal($.routes('match','/one/a/b/c/d')[1].c,'c');
  equal($.routes('match','/one/a/b/c/d')[1].d,'d');
});

test('Optional parameter url generation',function(){
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
    a: 'a',
    b: 'b'
  }),'/one/a/b');
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
    a: 'a'
  }),'/one/a/');
  equal($.routes("url",'ViewWithRoutes#optionalOne',{
  
  }),'/one/:a/');
});

test('Nested objects can contain routable views',function(){
  $.routes("set",'/nested_test/');
  equal(Deep.Nested.TestView.wasCalled,true);
});

asyncTest('Method calling and dispatch modifies address',function(){
  setTimeout(function(){
    start();
    ViewWithRoutes.instance().home();
    ViewWithRoutes.instance().article({
      id: 5
    });
    equal($.routes('get'),$.routes('url','ViewWithRoutes#article',{id:'5'}));
    equal(ViewWithRoutes.instance().lastParams.id,5);
  },50);
});