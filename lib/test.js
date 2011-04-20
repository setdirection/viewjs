(function() {
  var Backbone, Builder, RouteResolver, Router, TestServer, View, ViewServer, array_from, assert, file_exists, fs, http, jQuery, jsdom, public, test_stack, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  assert = require('assert');
  _ref = require('./view.client.js'), View = _ref.View, Builder = _ref.Builder, Router = _ref.Router, RouteResolver = _ref.RouteResolver;
  jsdom = require('jsdom').jsdom;
  jQuery = require('jquery');
  Backbone = require('backbone');
  global.Backbone = Backbone;
  array_from = function(object) {
    var length, results;
    if (!object) {
      return [];
    }
    length = object.length || 0;
    results = new Array(length);
    while (length--) {
      results[length] = object[length];
    }
    return results;
  };
  View.extend({
    env: {
      set: {
        test: true
      }
    },
    document: jsdom('<html><head></head><body></body></html>')
  });
  module.exports.parses = function() {
    return assert.ok(true);
  };
  module.exports.stack = function(before_exit) {
    var StackView, i, sequence;
    i = 0;
    sequence = [];
    StackView = View.create({
      StackView: {
        stack: {
          initialize: {
            add: function(next) {
              sequence.push('a');
              this.a = 'a';
              ++i;
              return next();
            }
          }
        }
      }
    }).StackView;
    StackView.extend({
      stack: {
        initialize: {
          add: function(next) {
            sequence.push('b');
            this.b = 'b';
            ++i;
            return next();
          }
        }
      }
    });
    return StackView.initialize(function() {
      return before_exit(function() {
        assert.equal(StackView._stack.initialize.stack.length, 3);
        assert.equal(2, i);
        assert.equal(StackView.a, 'a');
        assert.equal(StackView.b, 'b');
        assert.equal(sequence[0], 'a');
        return assert.equal(sequence[1], 'b');
      });
    });
  };
  module.exports.envBasics = function() {
    var call_count;
    View.env({
      set: {
        a: false,
        b: function() {
          return true;
        }
      }
    });
    call_count = 0;
    View.env({
      a: function() {
        return ++call_count;
      },
      b: function() {
        return ++call_count;
      }
    });
    assert.equal(call_count, 1);
    View.extend({
      env: {
        set: {
          a: function() {
            return true;
          },
          b: false
        }
      }
    });
    View.env({
      a: function() {
        return ++call_count;
      }
    });
    assert.equal(call_count, 2);
    View.env({
      b: function() {
        return ++call_count;
      }
    });
    assert.equal(call_count, 2);
    View.env({
      c: function() {
        return ++call_count;
      }
    });
    return assert.equal(call_count, 2);
  };
  module.exports.canDeferViewManagerCallback = function() {
    var call_count;
    call_count = 0;
    View({
      QuantumView: function() {
        return ++call_count;
      }
    });
    View.create({
      QuantumView: {}
    });
    return assert.equal(call_count, 1);
  };
  module.exports.canTriggerEvents = function() {
    var TestView, i;
    TestView = View.create({
      TestView: {}
    }).TestView;
    i = 0;
    TestView.bind('test', function() {
      return ++i;
    });
    TestView.trigger('test');
    return assert.equal(i, 1);
  };
  module.exports.canDetectModel = function(before_exit) {
    var ModelView, model, _model;
    _model = false;
    model = new Backbone.Model;
    model.set({
      key: 'value'
    });
    ModelView = View.create({
      ModelView: {
        model: model,
        initialize: function(next) {
          _model = this.model;
          return next();
        }
      }
    }).ModelView;
    return ModelView.initialize(function() {
      return before_exit(function() {
        assert.equal(ModelView.model, model);
        return assert.equal(_model, model);
      });
    });
  };
  module.exports.canDetectCollection = function(before_exit) {
    var CollectionView, collection, _collection;
    _collection = false;
    collection = new Backbone.Collection;
    CollectionView = View.create({
      CollectionView: {
        collection: collection,
        initialize: function(next) {
          _collection = this.collection;
          return next();
        }
      }
    }).CollectionView;
    return CollectionView.initialize(function() {
      return before_exit(function() {
        assert.equal(CollectionView.collection, collection);
        return assert.equal(CollectionView.collection, _collection);
      });
    });
  };
  module.exports.canRender = function() {
    var BuilderView;
    BuilderView = View.create({
      BuilderView: [
        Builder, {
          render: function() {
            return this.p('test');
          },
          on: {
            ready: function() {
              return assert.equal(this[0].firstChild.innerHTML, 'test');
            }
          }
        }
      ]
    }).BuilderView;
    return View({
      BuilderView: function() {
        return this.initialize();
      }
    });
  };
  module.exports.canRenderCollection = function() {
    var Item, List, ListView, contents, render_count;
    Item = Backbone.Model.extend();
    List = new (Backbone.Collection.extend({
      model: Item
    }));
    render_count = 0;
    contents = [
      {
        content: 'One'
      }, {
        content: 'Two'
      }, {
        content: 'Three'
      }
    ];
    List.add(array_from(contents));
    ListView = View.create({
      ListView: {
        collection: List,
        element: function() {
          return this.tag('ul');
        },
        render: function(item) {
          ++render_count;
          return this.tag('li', item.get('content'));
        }
      }
    }).ListView;
    return ListView.initialize(function() {
      assert.equal(this[0].tagName.toLowerCase(), 'ul');
      assert.equal(render_count, 3);
      assert.equal(ListView[0].childNodes.length, 3);
      assert.equal(ListView[0].firstChild.innerHTML, 'One');
      List.remove(List.at(0));
      assert.equal(render_count, 3);
      assert.equal(ListView[0].childNodes.length, 2);
      assert.equal(ListView[0].firstChild.innerHTML, 'Two');
      List.add({
        content: 'Four'
      });
      assert.equal(render_count, 4);
      assert.equal(ListView[0].childNodes.length, 3);
      assert.equal(ListView[0].firstChild.innerHTML, 'Two');
      assert.equal(ListView[0].childNodes[2].innerHTML, 'Four');
      List.refresh(contents);
      assert.equal(render_count, 7);
      assert.equal(ListView[0].childNodes.length, 3);
      assert.equal(ListView[0].firstChild.innerHTML, 'One');
      return assert.equal(ListView[0].childNodes[2].innerHTML, 'Three');
    });
  };
  module.exports.viewManager = function() {
    var TestView2, TestView3, _ref;
    View.create({
      TestView2: {
        key: 'value'
      }
    });
    View.create({
      TestView3: {
        key: 'value2'
      }
    });
    _ref = View(['TestView2', 'TestView3']), TestView2 = _ref[0], TestView3 = _ref[1];
    assert.equal(TestView2.key, 'value');
    return assert.equal(TestView3.key, 'value2');
  };
  module.exports.canUseCreateAsCallback = function() {
    var instance;
    instance = View.create(function() {
      return this.key = 'value';
    });
    return assert.equal(instance.key, 'value');
  };
  module.exports.canDepend = function() {
    var sequence;
    sequence = [];
    View.create({
      ParentView: {
        views: ['ChildView1', 'ChildView2', 'ChildView3'],
        initialize: function(next) {
          assert.equal(this.ChildView1.name, 'ChildView1');
          assert.equal(this.ChildView2.name, 'ChildView2');
          assert.equal(this.ChildView3.name, 'ChildView3');
          return next();
        }
      },
      ChildView1: {
        name: 'ChildView1',
        render: function() {
          sequence.push('a');
          return this.document.createElement('div');
        }
      },
      ChildView2: {
        name: 'ChildView2',
        render: function() {
          sequence.push('b');
          return this.document.createElement('div');
        }
      },
      ChildView3: {
        name: 'ChildView3',
        render: function() {
          sequence.push('c');
          return this.document.createElement('div');
        }
      }
    });
    return View({
      ParentView: function() {
        this.initialize();
        return this.on({
          ready: function() {
            assert.equal(sequence[0], 'a');
            assert.equal(sequence[1], 'b');
            return assert.equal(sequence[2], 'c');
          }
        });
      }
    });
  };
  module.exports.canDependAsync = function(before_exit) {
    View.create({
      AsyncParentView: [
        Builder, {
          views: ['AsyncChildView1', 'AsyncChildView2'],
          initialize: function(next) {
            return setTimeout(next, 50);
          },
          render: function() {
            return this.ul(this.AsyncChildView1, this.AsyncChildView2);
          }
        }
      ],
      AsyncChildView1: [
        Builder, {
          initialize: function(next) {
            return setTimeout(next, 1);
          },
          render: function() {
            return this.li('A');
          }
        }
      ],
      AsyncChildView2: [
        Builder, {
          initialize: function(next) {
            return setTimeout(next, 100);
          },
          render: function() {
            return this.li('B');
          }
        }
      ]
    });
    return View({
      AsyncParentView: function() {
        this.initialize();
        return this.on({
          ready: function() {
            return before_exit(__bind(function() {
              return assert.equal(jQuery('li:first', this[0]).html(), 'A');
            }, this));
          }
        });
      }
    });
  };
  module.exports.canPassViewsToBuilder = function() {
    var InnerView, OuterView;
    OuterView = View.create({
      OuterView: [
        Builder, {
          initialize: function(next) {
            InnerView.on({
              ready: next
            });
            return InnerView.initialize();
          },
          render: function() {
            return this.div(InnerView, {
              "class": 'test'
            });
          },
          on: {
            ready: function() {
              return assert.equal(this[0].firstChild.firstChild.firstChild.innerHTML, 'test');
            }
          }
        }
      ]
    }).OuterView;
    InnerView = View.create({
      InnerView: [
        Builder, {
          render: function() {
            return this.p('test');
          }
        }
      ]
    }).InnerView;
    return OuterView.initialize();
  };
  module.exports.canDiscardMixin = function() {
    var DiscardChildView, DiscardView;
    View.extend({
      extend: {
        discard: function(value, discard) {
          this.discard = value;
          return discard();
        }
      }
    });
    DiscardView = View.create({
      DiscardView: {}
    }).DiscardView;
    DiscardView.extend({
      discard: 'discard'
    });
    DiscardChildView = DiscardView.create({
      DiscardChildView: {}
    }).DiscardChildView;
    assert.equal(DiscardView.discard, 'discard');
    return assert.equal(typeof DiscardChildView.discard, 'undefined');
  };
  module.exports.canObserveKeyChanges = function() {
    var KeyChangeView, _a, _b, _c;
    _a = '';
    _b = '';
    _c = '';
    KeyChangeView = View.create({
      KeyChangeView: {
        on: {
          change: {
            a: function(a) {
              return _a = a;
            },
            b: function(b) {
              return _b = b;
            }
          }
        }
      }
    }).KeyChangeView;
    KeyChangeView.bind('change:c', function(c) {
      return _c = c;
    });
    KeyChangeView.set({
      a: 'a',
      b: 'b',
      c: 'c'
    });
    assert.equal(_a, 'a');
    assert.equal(_b, 'b');
    return assert.equal(_c, 'c');
  };
  module.exports.canHaveDefaults = function() {
    var DefaultsView;
    DefaultsView = View.create({
      DefaultsView: {
        defaults: {
          key: 'value'
        }
      }
    }).DefaultsView;
    assert.equal(DefaultsView.get('key'), 'value');
    return assert.equal(DefaultsView.create().get('key'), 'value');
  };
  module.exports.canUseArrayInBuilder = function(before_exit) {
    var ArrayBuilderViewA, ArrayBuilderViewB, ArrayBuilderViewC, _ref;
    _ref = View.create({
      ArrayBuilderViewA: {
        views: ['ArrayBuilderViewB', 'ArrayBuilderViewC'],
        render: function() {
          return this.tag('ul', [this.ArrayBuilderViewB, this.ArrayBuilderViewC]);
        }
      },
      ArrayBuilderViewB: {
        render: function() {
          return this.tag('li', 'b');
        }
      },
      ArrayBuilderViewC: {
        render: function() {
          return this.tag('li', 'c');
        }
      }
    }), ArrayBuilderViewA = _ref.ArrayBuilderViewA, ArrayBuilderViewB = _ref.ArrayBuilderViewB, ArrayBuilderViewC = _ref.ArrayBuilderViewC;
    return ArrayBuilderViewA.initialize(function() {
      return before_exit(__bind(function() {
        assert.ok(this[0].firstChild.firstChild != null);
        return assert.equal(this[0].firstChild.firstChild.firstChild.innerHTML, 'b');
      }, this));
    });
  };
  module.exports.router = function(before_exit) {
    var ContainerView, IndexView, PostView, callback_count, index_view_render_count, post_view_render_count, _ref;
    View.extend({
      routes: {
        '/': 'IndexView',
        '/post/:id?': 'PostView',
        '/:a/:b/:c?': 'AlphabetView'
      }
    });
    View.extend({
      env: {
        set: {
          server: function() {
            return false;
          },
          browser: function() {
            return false;
          }
        }
      }
    });
    post_view_render_count = 0;
    index_view_render_count = 0;
    _ref = View.create({
      SidebarView: {
        render: function() {
          return this.tag('div', {
            "class": 'sidebar'
          });
        }
      },
      PostView: {
        on: {
          change: {
            id: function() {
              return this.render();
            }
          }
        },
        render: function() {
          ++post_view_render_count;
          return this.tag('div', 'post');
        }
      },
      IndexView: {
        render: function() {
          ++index_view_render_count;
          return this.tag('div', 'index');
        }
      },
      ContainerView: [
        Router, {
          views: ['SidebarView'],
          render: function() {
            var element;
            element = this.tag('div', this.SidebarView, this.tag('div', this.Router));
            return element;
          }
        }
      ],
      AlphabetView: {}
    }), PostView = _ref.PostView, IndexView = _ref.IndexView, ContainerView = _ref.ContainerView;
    assert.deepEqual('/post/5', RouteResolver({
      PostView: {
        id: 5
      }
    }));
    assert.deepEqual({
      PostView: {
        id: "5"
      }
    }, RouteResolver('/post/5'));
    assert.deepEqual('/', RouteResolver({
      IndexView: {}
    }));
    assert.deepEqual({
      IndexView: {}
    }, RouteResolver('/'));
    assert.deepEqual({
      AlphabetView: {
        a: 'a',
        b: 'b',
        c: 'c'
      }
    }, RouteResolver('/a/b/c'));
    assert.deepEqual({
      AlphabetView: {
        a: 'a',
        b: 'b',
        c: 'c'
      }
    }, RouteResolver('/a/b/c'));
    assert.deepEqual('/a/b/', RouteResolver({
      AlphabetView: {
        a: 'a',
        b: 'b'
      }
    }));
    assert.equal('/a/b/c', RouteResolver({
      AlphabetView: ['a', 'b', 'c']
    }));
    assert.equal('/post/5', PostView.url({
      id: 5
    }));
    assert.equal('/', IndexView.url());
    assert.equal('/post/5', IndexView.url({
      PostView: {
        id: 5
      }
    }));
    assert.equal('/', RouteResolver('IndexView'));
    callback_count = 0;
    ContainerView.initialize(function() {
      return RouteResolver('/post/5', function(view, params) {
        assert.equal(view.get('id'), '5');
        assert.ok(PostView.element().style.display !== 'none');
        assert.ok(IndexView.element().style.display === 'none');
        ++callback_count;
        return RouteResolver({
          IndexView: {}
        }, function(view, params) {
          assert.ok(IndexView.element().style.display !== 'none');
          assert.ok(PostView.element().style.display === 'none');
          ++callback_count;
          return RouteResolver({
            PostView: ['4']
          }, function(view, params) {
            assert.equal(view.get('id'), '4');
            assert.ok(PostView.element().style.display !== 'none');
            assert.ok(IndexView.element().style.display === 'none');
            ++callback_count;
            return RouteResolver({
              IndexView: {}
            }, function(view, params) {
              assert.ok(IndexView.element().style.display !== 'none');
              assert.ok(PostView.element().style.display === 'none');
              ++callback_count;
              PostView.unbind('route');
              return RouteResolver({
                PostView: {
                  id: 4
                }
              }, function(view, params) {
                assert.ok(IndexView.element().style.display === 'none');
                assert.ok(PostView.element().style.display !== 'none');
                ++callback_count;
                return before_exit(function() {
                  assert.equal(5, callback_count);
                  assert.equal(4, post_view_render_count);
                  return assert.equal(1, index_view_render_count);
                });
              });
            });
          });
        });
      });
    });
    return View.extend({
      env: {
        server: function() {
          return true;
        },
        browser: function() {
          return false;
        }
      }
    });
  };
  module.exports.canPassDataInitialize = function(before_exit) {
    var attributes, collection, model, model_view;
    model = new Backbone.Model;
    collection = new Backbone.Collection;
    attributes = {
      key: 'value'
    };
    model_view = View.create();
    return model_view.initialize(model, function() {
      var collection_view;
      assert.equal(model_view.model, model);
      collection_view = View.create();
      return collection_view.initialize(collection, function() {
        var attributes_view;
        assert.equal(collection_view.collection, collection);
        attributes_view = View.create();
        attributes_view.initialize(attributes, function() {});
        return before_exit(function() {
          return assert.equal(attributes.key, attributes_view.get('key'));
        });
      });
    });
  };
  module.exports.canUse$InBuilder = function(before_exit) {
    var $BuilderView, click_count;
    click_count = 0;
    $BuilderView = View.create({
      $BuilderView: [
        Builder, {
          $: jQuery,
          delegate: {
            'click div': function() {
              return ++click_count;
            },
            click: {
              div: function() {
                return ++click_count;
              }
            }
          },
          render: function() {
            this.key = 'test';
            return this.table(this.tr(this.td(), this.td(this.div().click(__bind(function() {
              ++click_count;
              return assert.equal(this.key, 'test');
            }, this)))));
          }
        }
      ]
    }).$BuilderView;
    return $BuilderView.initialize(function() {
      return before_exit(function() {
        $BuilderView.$('div').trigger('click');
        assert.equal(click_count, 3);
        return assert.equal($BuilderView.$('td').length, 2);
      });
    });
  };
  module.exports.canReverseLookup = function() {
    var ReverseLookupView;
    ReverseLookupView = View.create({
      ReverseLookupView: {
        $: jQuery
      }
    }).ReverseLookupView;
    return ReverseLookupView.initialize(function() {
      assert.equal(jQuery(this).view().name, 'ReverseLookupView');
      return assert.equal(this.$.view().name, 'ReverseLookupView');
    });
  };
  module.exports.anonViewHasElement = function() {
    var anon;
    anon = View.create();
    assert.ok(anon[0]);
    return assert.equal(anon[0].tagName, 'DIV');
  };
  http = require('http');
  fs = require('fs');
  file_exists = function(path) {
    try {
      fs.lstatSync(path);
      return true;
    } catch (e) {
      return false;
    }
  };
  public = __dirname + '/../test/public';
  ViewServer = require('./view.server.js').ViewServer;
  TestServer = ViewServer.create({
    TestServer: {
      public: public
    }
  }).TestServer;
  module.exports.serverWithoutPortDoesNotListen = function() {
    return assert.isUndefined(TestServer.server);
  };
  test_stack = [];
  test_stack.push(function(next) {
    var StaticServer1, StaticServer2, request_count;
    StaticServer1 = TestServer.create({
      StaticServer1: {
        port: 40001
      }
    }).StaticServer1;
    StaticServer2 = TestServer.create({
      StaticServer2: {
        port: 40002
      }
    }).StaticServer2;
    request_count = 0;
    return http.get({
      host: 'localhost',
      port: 40001,
      path: '/test.html'
    }, function(response) {
      return response.on('data', function(data) {
        assert.equal('Test', data.toString());
        StaticServer1.server.close();
        return http.get({
          host: 'localhost',
          port: 40002,
          path: '/test.html'
        }, function(response) {
          return response.on('data', function(data) {
            assert.equal('Test', data.toString());
            StaticServer2.server.close();
            return next();
          });
        });
      });
    });
  });
  test_stack.push(function(next) {
    var BasicAppServer, request_count;
    request_count = 0;
    BasicAppServer = TestServer.create({
      BasicAppServer: {
        port: 40003,
        routes: {
          '/': 'BasicView',
          '/template': 'TemplateView'
        },
        execute: ["" + public + "/javascripts/lib/jquery.js", "" + public + "/javascripts/lib/underscore.js", "" + public + "/javascripts/lib/backbone.js", "" + public + "/javascripts/lib/view.js", "" + public + "/javascripts/templates.js", "" + public + "/javascripts/views/basic.js"],
        javascripts: ["http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"]
      }
    }).BasicAppServer;
    return http.get({
      host: 'localhost',
      port: 40003,
      path: '/'
    }, function(response) {
      ++request_count;
      return response.on('data', function(data) {
        assert.match(data.toString(), /<div>test<\/div>/);
        assert.match(data.toString(), /src="http:\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1.5.1\/jquery.min.js"/);
        return http.get({
          host: 'localhost',
          port: 40003,
          path: '/template'
        }, function(response) {
          ++request_count;
          return response.on('data', function(data) {
            assert.match(data.toString(), /<p>value<\/p>/);
            BasicAppServer.server.close();
            assert.equal(request_count, 2);
            return next();
          });
        });
      });
    });
  });
  test_stack.push(function(next) {
    var ProxyServer, ProxyServerSource1, ProxyServerSource2;
    ProxyServerSource1 = ViewServer.create({
      ProxyServerSource1: {
        port: 40004
      }
    }).ProxyServerSource1;
    ProxyServerSource1.server.get('/1', function(request, response) {
      return response.send('a');
    });
    ProxyServerSource2 = ViewServer.create({
      ProxyServerSource2: {
        port: 40005
      }
    }).ProxyServerSource2;
    ProxyServerSource2.server.get('/2', function(request, response) {
      return response.send('b');
    });
    ProxyServer = ViewServer.create({
      ProxyServer: {
        port: 40006,
        routes: {
          '/a/': 40004,
          '/b': 40005
        }
      }
    }).ProxyServer;
    return http.get({
      host: 'localhost',
      port: 40006,
      path: '/a/1'
    }, function(response) {
      return response.on('data', function(data) {
        assert.equal(data.toString(), 'a');
        return http.get({
          host: 'localhost',
          port: 40006,
          path: '/b/2'
        }, function(response) {
          return response.on('data', function(data) {
            ProxyServerSource1.server.close();
            ProxyServerSource2.server.close();
            ProxyServer.server.close();
            assert.equal(data.toString(), 'b');
            return next();
          });
        });
      });
    });
  });
  test_stack.push(function(next) {
    var ConditionalViewServer, a_was_set, b_was_set, c_was_set;
    ViewServer.env({
      set: {
        a: function() {
          return false;
        },
        b: true,
        c: function() {
          return true;
        }
      }
    });
    a_was_set = false;
    b_was_set = false;
    c_was_set = false;
    ViewServer.env(false, {
      a: function() {
        return a_was_set = true;
      },
      b: function() {
        return b_was_set = true;
      },
      c: function() {
        return c_was_set = true;
      }
    });
    assert.equal(a_was_set, false);
    assert.equal(b_was_set, true);
    assert.equal(c_was_set, true);
    ConditionalViewServer = TestServer.create({
      ConditionalViewServer: {
        port: 40007,
        routes: {
          '/': 'BasicView'
        },
        execute: ["" + public + "/javascripts/lib/jquery.js", "" + public + "/javascripts/lib/underscore.js", "" + public + "/javascripts/lib/backbone.js", "" + public + "/javascripts/lib/view.js", "" + public + "/javascripts/templates.js", "" + public + "/javascripts/views/basic.js"],
        env: {
          a: function() {
            return {
              stylesheets: ['a']
            };
          },
          b: {
            stylesheets: ['b']
          },
          c: function() {
            return {
              stylesheets: 'c'
            };
          }
        }
      }
    }).ConditionalViewServer;
    return http.get({
      host: 'localhost',
      port: 40007,
      path: '/'
    }, function(response) {
      return response.on('data', function(data) {
        assert.match(data.toString(), /href="b"/);
        assert.match(data.toString(), /href="c"/);
        assert.isNull(data.toString().match(/href="a"/));
        ConditionalViewServer.server.close();
        return next();
      });
    });
  });
  test_stack.push(function(next) {
    var CachingViewServer, cache_location;
    CachingViewServer = TestServer.create({
      CachingViewServer: {
        port: 40008,
        routes: {
          '/': 'BasicView',
          '/test/test2/test3/test4/test5/template': 'TemplateView',
          '/text': 'TextView'
        },
        cache: ['BasicView', 'TemplateView'],
        execute: ["" + public + "/javascripts/lib/jquery.js", "" + public + "/javascripts/lib/underscore.js", "" + public + "/javascripts/lib/backbone.js", "" + public + "/javascripts/lib/view.js", "" + public + "/javascripts/templates.js", "" + public + "/javascripts/views/basic.js"]
      }
    }).CachingViewServer;
    cache_location = public + '/../cache';
    if (file_exists(cache_location + '/index.html')) {
      fs.unlinkSync(cache_location + '/index.html');
    }
    if (file_exists(cache_location + '/test/test2/test3/test4/test5/template.html')) {
      fs.unlinkSync(cache_location + '/test/test2/test3/test4/test5/template.html');
    }
    if (file_exists(cache_location + '/test/test2/test3/test4/test5')) {
      fs.rmdirSync(cache_location + '/test/test2/test3/test4/test5');
    }
    if (file_exists(cache_location + '/test/test2/test3/test4')) {
      fs.rmdirSync(cache_location + '/test/test2/test3/test4');
    }
    if (file_exists(cache_location + '/test/test2/test3')) {
      fs.rmdirSync(cache_location + '/test/test2/test3');
    }
    if (file_exists(cache_location + '/test/test2')) {
      fs.rmdirSync(cache_location + '/test/test2');
    }
    if (file_exists(cache_location + '/test')) {
      fs.rmdirSync(cache_location + '/test');
    }
    assert.equal(false, file_exists(cache_location + '/index.html'));
    return http.get({
      host: 'localhost',
      port: 40008,
      path: '/'
    }, function(response) {
      assert.equal(true, file_exists(cache_location + '/index.html'));
      return response.on('data', function(data) {
        assert.equal(data.toString(), fs.readFileSync(cache_location + '/index.html'));
        return http.get({
          host: 'localhost',
          port: 40008,
          path: '/text'
        }, function(response) {
          assert.equal(false, file_exists(cache_location + '/text.html'));
          return response.on('data', function(data) {
            assert.match(data.toString(), /<div>test<\/div>/);
            assert.equal(false, file_exists(cache_location + '/test/test2/test3/test4/test5/template.html'));
            return http.get({
              host: 'localhost',
              port: 40008,
              path: '/test/test2/test3/test4/test5/template'
            }, function(response) {
              assert.equal(true, file_exists(cache_location + '/test/test2/test3/test4/test5/template.html'));
              return response.on('data', function(data) {
                assert.equal(data.toString(), fs.readFileSync(cache_location + '/test/test2/test3/test4/test5/template.html'));
                fs.unlinkSync(cache_location + '/index.html');
                fs.unlinkSync(cache_location + '/test/test2/test3/test4/test5/template.html');
                fs.rmdirSync(cache_location + '/test/test2/test3/test4/test5');
                fs.rmdirSync(cache_location + '/test/test2/test3/test4');
                fs.rmdirSync(cache_location + '/test/test2/test3');
                fs.rmdirSync(cache_location + '/test/test2');
                fs.rmdirSync(cache_location + '/test');
                CachingViewServer.server.close();
                return next();
              });
            });
          });
        });
      });
    });
  });
  module.exports.runServerTests = function() {
    var test_iterator;
    test_iterator = function() {
      var test;
      test = test_stack.shift();
      if (test) {
        return test(test_iterator);
      }
    };
    return test_iterator();
  };
}).call(this);
