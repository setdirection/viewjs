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
              this.li(),
              [
                this.li(),
                [
                  this.li(),
                  this.li(),
                  [
                    this.li()
                  ]
                ]
              ]
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

var HTMLStringView = $.view(function(){
  return this.div(
    this.ul(
      '<li>one</li>',
      this.li('<span class="test"><b>two</b></span>'),
      [
        '<li>three</li>',
        this.li('<b>four</b>')
      ],
      '<li>five</li><li>six</li>',
      '<li>seven</li>',
      this.li(' <b>eight</b>')
    )
  );
});
var HTMLStringConstructorView = $.view(function(){
  return '<ul><li><span class="test">test</span></li></ul>';
});

var HTMLView = $.view('<ul><li><span><b>test</b></span></li></ul>');

var TextNodeView = $.view(function(){
  return this.ul(
    this.li('one'),
    this.li(document.createTextNode('two'))
  );
});

test("Node creation with text node",function(){
  var instance = new TextNodeView();
  var items = $('li',instance);
  equal($(items[0]).html(),'one');
  equal($(items[1]).html(),'two');
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

test('HTML strings can be mixed and matched with builder args',function(){
  var instance = new HTMLStringView();
  equal($($('li',instance)[0]).html(),'one');
  equal($('span.test',instance)[0].firstChild.innerHTML,'two');
  equal($($('li',instance)[2]).html(),'three');
  equal($('li',instance)[3].firstChild.innerHTML,'four');
  equal($('li',instance)[4].innerHTML,'five');
  equal($('li',instance)[5].innerHTML,'six');
  equal($('li',instance)[6].innerHTML,'seven');
  equal($('li',instance)[7].innerHTML,' &lt;b&gt;eight&lt;/b&gt;');
});

test("Node creation with deep nesting",function(){
  var deep_instance = new DeepView();
  equal(deep_instance.element().firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue,'test');
});

test("Constructor can return an HTML string",function(){
  var instance = new HTMLStringConstructorView();
  equal($('span.test',instance).html(),'test');
});

test("Constructor can be an HTML string",function(){
  var instance = new HTMLView();
  equal($('b',instance).html(),'test');
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
  equal(parent.constructor._methodsToProxy.length,'3');
  equal(child.constructor._methodsToProxy.length,'4');
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

OneEventTestView = $.view(function(){
  this.numberOfTriggers = 0;
  this.one('test',function(){
    ++this.numberOfTriggers;
  });
  this.trigger('test');
  this.trigger('test');
  return this.div();
});
test('"one" only observes first event call',function(){
  var test = new OneEventTestView();
  equal(test.numberOfTriggers,1);
})

var ReadyTestView = $.view(function(){
  this.readyEventHasFired = false;
  this.ready(function(){
    this.readyEventHasFired = true;
  });
  return this.div();
});

asyncTest("ready event fires only once element attached to DOM",function(){
  var view = new ReadyTestView();
  equal(view.readyEventHasFired,false);
  $(view).appendTo(document.body);
  setTimeout(function(){
    equal(view.readyEventHasFired,true);
    start();
  },55);
});

ChangedEventView = $.view(function(){
  return "<div>test</div>"
});
test("changed event, with more \"one\" method testing",function(){
  var instance = new ChangedEventView();
  instance.one('change',function(attributes){
    equal(attributes.key,'value');
  });
  instance.set('key','value');
  instance.set('key','value2');
  instance.one('change',function(attributes){
    equal(attributes.key2,'value');
    ok('key' in attributes);
    equal(attributes.key,null);
  });
  instance.attributes({key2:'value'});
});

StringTemplateView = $.view('<b>${key}</b>');
StringReturningTemplateView = $.view(function(){
  return '<b>${key}</b>';
});
ComplexTemplateView = $.view(function(){
  return this.ul(
    this.li('${a}'),
    '<li>${b}</li>',
    this.map(['c','d'],function(key){
      return '<li>${' + key + '}</li>';
    })
  );
});

test("Template support",function(){
  equal(new StringTemplateView({key:'value'}).element().innerHTML,'value');
  equal(new StringReturningTemplateView({key:'value'}).element().innerHTML,'value');
  var attributes = {
    a: 'one',
    b: 'two',
    c: 'three',
    d: 'four'
  };
  var instance = new ComplexTemplateView(attributes);
  var items = $('li',instance);
  equal(items[0].innerHTML,attributes.a);
  equal(items[1].innerHTML,attributes.b);
  equal(items[2].innerHTML,attributes.c);
  equal(items[3].innerHTML,attributes.d);
});

(function(){
  var StringMustacheView = $.view('<b>{{key}}</b>');
  var StringReturningMustacheView = $.view(function(){
    return '<b>{{key}}</b>';
  });
  var ComplexMustacheView = $.view(function(){
    return this.ul(
      this.li('{{a}}'),
      '<li>{{b}}</li>',
      this.map(['c','d'],function(key){
        return '<li>{{' + key + '}}</li>';
      })
    );
  });
  test('Mustache support',function(){
    $.view('engine',{
      name: 'mustache',
      detect: function(string){
        return string.match(/\{\{[^\}]+\}\}/);
      },
      render: function(string,attributes){
        return Mustache.to_html(string,attributes);
      }
    });
    equal(new StringMustacheView({key:'value'}).element().innerHTML,'value');
    equal(new StringReturningMustacheView({key:'value'}).element().innerHTML,'value');
    var attributes = {
      a: 'one',
      b: 'two',
      c: 'three',
      d: 'four'
    };
    var instance = new ComplexMustacheView(attributes);
    var items = $('li',instance);
    equal(items[0].innerHTML,attributes.a);
    equal(items[1].innerHTML,attributes.b);
    equal(items[2].innerHTML,attributes.c);
    equal(items[3].innerHTML,attributes.d);
    $.view('engine','jquery.tmpl');
  });
})();

EscapingView = $.view(function(){
  this.set('key','value');
  return this.ul(
    this.li('${key}'),
    this.li(this.escape("${key}")),
    this.li(this.escape('<b>Test</b>'))
  );
});

test("HTML and templating escaping",function(){
  var instance = new EscapingView();
  var items = $('li',instance);
  equal(items[0].innerHTML,'value');
  equal(items[1].innerHTML,'${key}');
  equal(items[2].innerHTML,'&lt;b&gt;Test&lt;/b&gt;');
});

(function(){
  var ParentView = $.view(function(){
    return this.div();
  });
  var ChildViewOne = $.view(ParentView,function(element){
    $(element).addClass('one');
  });
  var ChildViewTwo = $.view(ParentView,function(element){
    $(element).addClass('two');
    return element;
  });
  var ChildViewThree = $.view(ChildViewTwo,function(element){
    return this.div({className:'three'},element);
  });
  var ChildViewFour = $.view(ChildViewThree,function(element){
    return this.div({className:'four'},element);
  });
  test("Child constructor may or may not return a DOM element",function(){
    var one = new ChildViewOne();
    var two = new ChildViewTwo();
    var three = new ChildViewThree();
    var four = new ChildViewFour();
    equal(one.element().className,'one');
    equal(two.element().className,'two');
    equal(three.element().className,'three');
    equal(three.element().firstChild.className,'two');
    equal(four.element().className,'four');
    equal(four.element().firstChild.className,'three');
    equal(four.element().firstChild.firstChild.className,'two');
  });
})();

(function(){
  var ChangeKeyEventView = $.view(function(){
    this.wasChangedTo = false;
    this.bind('change:id',function(value){
      this.wasChangedTo = value;
    });
    this.set('id',true);
    return this.div();
  });
  test("Test of change:key event",function(){
    var instance = new ChangeKeyEventView();
    equal(instance.wasChangedTo,true);
  });
})();

(function(){
  var CallbackView = $.view(function(){
    this.callbackTest = this.callback('myCallback','test');
    return this.div();
  },{
    myCallback: function(value){
      this.value = value;
    }
  });
  var EmitView = $.view(function(){
    this.bind('event',function(value){
      this.value = value;
    });
    this.emit('event','test')();
    return this.div();
  });
  test("Test of callback and emit.",function(){
    var instance = new CallbackView();
    instance.callbackTest();
    equal(instance.value,'test');
    var instance = new EmitView();
    equal(instance.value,'test');
  });
})();