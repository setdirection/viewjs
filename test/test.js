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
  var element = this.ul(
    this.li('a'),
    $(this.li('b'))
  );
  return element;
});

test("Node creation with mix and match of text and elements",function(){
  var arguments_instance = new ArgumentsTestView();
  equal(arguments_instance.getElement().firstChild.firstChild.nodeValue,'one');
  equal(arguments_instance.getElement().firstChild.childNodes[2].tagName,'B');
});

test("Node creation with jQuery methods being called",function(){
  var jquery_view_instance = new ViewWithJQuery();
  var list_items = $('li',jquery_view_instance.getElement());
  equal(list_items.length,2);
  equal(list_items[1].innerHTML,'b');
});

test("Node creation with deep nesting",function(){
  var deep_instance = new DeepView();
  equal(deep_instance.getElement().firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue,'test');
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
test('attached event firing on class, instance and after attached',function(){
  ParentView.bind('attached',function(){
    ++trigger_count;
  });
  var parent_instance = new ParentView();
  parent_instance.bind('attached',function(){
    ++trigger_count;
  });
  document.body.appendChild(parent_instance.getElement());
  parent_instance.bind('attached',function(){
    ++trigger_count;
  });
  equal(trigger_count,3);
});
test('attached event cascades to child class',function(){
  //observing "attached" immediately after inserting will syncrhonusly trigger other observers that had been delayed
  child_instance = new ChildView();
  document.body.appendChild(child_instance.getElement());
  child_instance.bind('attached',function(){
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

test('View subclass attributes cascades to child',function(){
  var child = new ChildViewTwo({value:'test'});
  equal(child.get('a'),1);
  equal(child.get('b'),2);
});

test('Parent element passed to child constructor',function(){
  var child = new ChildViewTwo({value:'test'});
  document.body.appendChild(child.getElement());
  equal(child.getText(),'test');
  equal(child.textNode.className,'added');
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