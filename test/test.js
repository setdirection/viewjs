//put tag methods on jQuery object
$.view.exportTags($);

var ArgumentsTestView = $.view(function(){
  return $.ul(
    $.li('one','two',$.b('three'),'four',$.b('five')),
    $.li({className: 'test'}),
    {className: 'blarg'}
  );
});

var DeepView = $.view(function(){
  return $.div(
    $.table(
      $.tbody(
        $.tr(
          $.td(
            $.ul(
              $.li($.span($.b('test'))),
              $.li()
            )
          ),
          $.td(
            $.p($.span('test'))
          )
        ),
        $.tr(
          $.td(
            
          ),
          $.td(
            
          )
        )
      )
    )
  );
});

test("Node creation with mix and match of text and elements",function(){
  var arguments_instance = new ArgumentsTestView();
  equal(arguments_instance.getElement().firstChild.firstChild.nodeValue,'one');
  equal(arguments_instance.getElement().firstChild.childNodes[2].tagName,'B');
});

test("Node creation with deep nesting",function(){
  var deep_instance = new DeepView();
  equal(deep_instance.getElement().firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue,'test');
});

var trigger_count = 0;
var ParentView = $.view(function(){
  return $.span();
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
  this.textNode = $.span();
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

var ChildViewTwo = $.view(ParentView,function(parent_element){
  this.set('b',2);
  parent_element.className = 'added';
  this.trigger('child_event','b');
  return parent_element;
},{
  childTrigger: function(){
    this.trigger('child_trigger_event','b');
  }
});
ChildView.className = 'ChildView.Class';
ChildView.prototype.className = 'ChildView.Instnace';

test('View subclass attributes cascades to child',function(){
  var child = new ChildView({value:'test'});
  equal(child.get('a'),1);
  equal(child.get('b'),2);
});

test('Parent element passed to child constructor',function(){
  var child = new ChildView({value:'test'});
  document.body.appendChild(child.getElement());
  equal(child.getText(),'test');
  equal(child.textNode.className,'added');
});

test('Instance events inherited and triggered properly',function(){
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
  euqal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');
});

test('Class events triggered properly',function(){
  var trigger_count = 0;
  var notify_arg_from_parent = false;
  var notify_arg_from_child = false;
  ChildView.bind('parent_event',function(){
    ++trigger_count;
    notify_arg_from_parent = arguments[1];
  });
  ChildView.bind('child_event',function(){
    ++trigger_count;
    notify_arg_from_child = arguments[1];
  });
  new ChildView({value: 'test'});
  equal(trigger_count,2);
  equal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');
});

test('Event registered on parent class cascades to child',function(){
  var trigger_count = 0;
  var notify_arg_from_parent_class;
  var notify_arg_from_parent = false;
  var notify_arg_from_child = false;
  ParentView.bind('parent_event',function(){
    ++trigger_count;
    notify_arg_from_parent_class = arguments[1];
  });
  new ChildView({value: 'test'});
  equal(trigger_count,5);
  equal(notify_arg_from_parent_class,'a');
  equal(notify_arg_from_parent,'a');
  equal(notify_arg_from_child,'b');
});

test('stopObserving on child unregisters all including cascaded observer but does not unregister parent observer',function(){
  var trigger_count = 0;
  var notify_arg_from_parent_class = false;
  var notify_arg_from_parent = false;
  var notify_arg_from_child = false;
  ChildView.unbind('parent_event');
  new ChildView({value: 'test'});
  equal(trigger_count,1);
  equal(notify_arg_from_parent_class,false);
  equal(notify_arg_from_parent,false);
  equal(notify_arg_from_child,'b');
  new ParentView({value: 'test'});
  equal(trigger_count,2);
  equal(notify_arg_from_parent_class,'a');
});



/*
test("module without setup/teardown (default)", function() {
	expect(1);
	ok(true);
});

test("expect in test", 3, function() {
	ok(true);
	ok(true);
	ok(true);
});

test("expect in test", 1, function() {
	ok(true);
});

module("setup test", {
	setup: function() {
		ok(true);
	}
});

test("module with setup", function() {
	expect(2);
	ok(true);
});

test("module with setup, expect in test call", 2, function() {
	ok(true);
});

var state;

module("setup/teardown test", {
	setup: function() {
		state = true;
		ok(true);
	},
	teardown: function() {
		ok(true);
	}
});

test("module with setup/teardown", function() {
	expect(3);
	ok(true);
});

module("setup/teardown test 2");

test("module without setup/teardown", function() {
	expect(1);
	ok(true);
});

if (typeof setTimeout !== 'undefined') {
state = 'fail';

module("teardown and stop", {
	teardown: function() {
		equal(state, "done", "Test teardown.");
	}
});

test("teardown must be called after test ended", function() {
	expect(1);
	stop();
	setTimeout(function() {
		state = "done";
		start();
	}, 13);
});

module("async setup test", {
	setup: function() {
	  stop();
		setTimeout(function(){
			ok(true);
			start();
		}, 500);
	}
});

asyncTest("module with async setup", function() {
	expect(2);
	ok(true);
	start();
});

module("async teardown test", {
	teardown: function() {
		stop();
		setTimeout(function(){
			ok(true);
			start();
		}, 500);
	}
});

asyncTest("module with async teardown", function() {
	expect(2);
	ok(true);
	start();
});

module("asyncTest");

asyncTest("asyncTest", function() {
	expect(2);
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});

asyncTest("asyncTest", 2, function() {
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});
}

module("save scope", {
	setup: function() {
		this.foo = "bar";
	},
	teardown: function() {
		deepEqual(this.foo, "bar");
	}
});
test("scope check", function() {
	expect(2);
	deepEqual(this.foo, "bar");
});

module("simple testEnvironment setup", {
	foo: "bar",
	bugid: "#5311" // example of meta-data
});
test("scope check", function() {
	deepEqual(this.foo, "bar");
});
test("modify testEnvironment",function() {
	this.foo="hamster";
});
test("testEnvironment reset for next test",function() {
	deepEqual(this.foo, "bar");
});

module("testEnvironment with object", {
	options:{
		recipe:"soup",
		ingredients:["hamster","onions"]
	}
});
test("scope check", function() {
	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions"]}) ;
});
test("modify testEnvironment",function() {
	// since we do a shallow copy, the testEnvironment can be modified
	this.options.ingredients.push("carrots");
});
test("testEnvironment reset for next test",function() {
	deepEqual(this.options, {recipe:"soup",ingredients:["hamster","onions","carrots"]}, "Is this a bug or a feature? Could do a deep copy") ;
});


module("testEnvironment tests");

function makeurl() {
	var testEnv = QUnit.current_testEnvironment;
	var url = testEnv.url || 'http://example.com/search';
	var q   = testEnv.q   || 'a search test';
	return url + '?q='+encodeURIComponent(q);
}

test("makeurl working",function() {
	equal( QUnit.current_testEnvironment, this, 'The current testEnvironment is global');
	equal( makeurl(), 'http://example.com/search?q=a%20search%20test', 'makeurl returns a default url if nothing specified in the testEnvironment');
});

module("testEnvironment with makeurl settings", {
	url: 'http://google.com/',
	q: 'another_search_test'
});
test("makeurl working with settings from testEnvironment", function() {
	equal( makeurl(), 'http://google.com/?q=another_search_test', 'rather than passing arguments, we use test metadata to form the url');
});
test("each test can extend the module testEnvironment", {
	q:'hamstersoup'
}, function() {
	equal( makeurl(), 'http://google.com/?q=hamstersoup', 'url from module, q from test');	
});

module("jsDump");
test("jsDump output", function() {
	equals( QUnit.jsDump.parse([1, 2]), "[\n  1,\n  2\n]" );
	equals( QUnit.jsDump.parse({top: 5, left: 0}), "{\n  \"top\": 5,\n  \"left\": 0\n}" );
	if (typeof document !== 'undefined' && document.getElementById("qunit-header")) {
		equals( QUnit.jsDump.parse(document.getElementById("qunit-header")), "<h1 id=\"qunit-header\"></h1>" );
		equals( QUnit.jsDump.parse(document.getElementsByTagName("h1")), "[\n  <h1 id=\"qunit-header\"></h1>\n]" );
	}
});

module("assertions");
test("raises", function() {
	function thrower1() {
		throw 'Errored!';
	}
	function thrower2() {
		throw new TypeError("Type!");
	}
	function thrower3() {
		throw {message:"Custom!"};
	}
	raises(thrower1, 'Errored!', 'throwing string');
	raises(thrower2, 'Type!', 'throwing TypeError instance');
	raises(thrower3, 'Custom!', 'throwing custom object');
});

if (typeof document !== "undefined") {

module("fixture");
test("setup", function() {
	document.getElementById("qunit-fixture").innerHTML = "foobar";
});
test("basics", function() {
	equal( document.getElementById("qunit-fixture").innerHTML, "test markup", "automatically reset" );
});

}

module("custom assertions");
(function() {
	function mod2(value, expected, message) {
		var actual = value % 2;
		QUnit.push(actual == expected, actual, expected, message);
	}
	test("mod2", function() {
		mod2(2, 0, "2 % 2 == 0");
		mod2(3, 1, "3 % 2 == 1");
	})
})();

(function() {
	var reset = QUnit.reset;
	function afterTest() {
		ok( false, "reset should not modify test status" );
	}
	module("reset");
	test("reset runs assertions", function() {
		QUnit.reset = function() {
			afterTest();
			reset.apply( this, arguments );
		};
	});
	test("reset runs assertions2", function() {
		QUnit.reset = reset;
	});
})();
*/