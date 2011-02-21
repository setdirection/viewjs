(function() {
  test('Class and inheritance', function() {
    var ViewA, ViewB, instance;
    instance = new View(false, {
      echo: function(b) {
        return this.a + b;
      }
    });
    instance.a = 'a';
    equal(instance.echo('b'), 'ab');
    ViewA = View({
      c: 'c',
      echo: function(b) {
        return this.a + b;
      }
    });
    instance = new ViewA;
    instance.a = 'a';
    equal(instance.echo('b'), 'ab');
    ViewB = View(ViewA, {
      echo: function(_b) {
        return '1' + ViewA.prototype.echo.call(this, _b) + this.c;
      }
    });
    instance = new ViewB;
    instance.a = 'a';
    equal(instance.echo('b'), '1abc');
    instance = new ViewA;
    instance.a = 'a';
    notEqual(ViewA.prototype.echo, ViewB.prototype.echo);
    return equal(instance.echo('b'), 'ab');
  });
  test('before and after', function() {
    var ViewWithBefore, ViewWithBefore2, instance, v;
    v = new View(false, {
      echo: function(a, b) {
        return a + b;
      }
    });
    equal(v.echo('a', 'b'), 'ab');
    v.before({
      echo: function(args, next) {
        return next(args[0] + args[0], args[1] + args[1]);
      }
    });
    equal(v.echo('a', 'b'), 'aabb');
    v.before({
      echo: function(args, next) {
        args[0] = args[0].toUpperCase();
        args[1] = args[1].toUpperCase();
        return next();
      }
    });
    equal(v.echo('a', 'b'), 'AABB');
    ViewWithBefore = View({
      echo: function(a, b) {
        return a + b;
      }
    }, {
      before: {
        echo: function(args, next) {
          return next(args[0].toUpperCase(), '');
        }
      }
    });
    instance = new ViewWithBefore;
    equal(instance.echo('a', 'b'), 'A');
    ViewWithBefore2 = View(ViewWithBefore);
    instance = new ViewWithBefore2;
    return equal(instance.echo('a', 'b'), 'A');
  });
  test('Render method and builder', function() {
    var instance, instance2, instance3, node, node2, node3, node4, v;
    instance = new View(false, {
      $: jQuery,
      render: function() {
        return this.div({
          "class": 'test'
        });
      }
    });
    instance2 = new View(false, {
      $: jQuery,
      render: ['html', '<div class="test2"></div>']
    });
    instance3 = new View(false, {
      $: jQuery,
      render: function() {
        return ['html', '<div class="test3"></div>'];
      }
    });
    equal(instance[0].className, 'test');
    equal(instance2[0].className, 'test2');
    equal(instance3[0].className, 'test3');
    v = new View(false, node = v.render({
      html: '<b>test</b>'
    }));
    node2 = v.render('html', '<b>test2</b>');
    node3 = v.render(function() {
      return ['html', '<b>test3</b>'];
    });
    node4 = v.render(function() {
      return this.b('test4');
    });
    equal(node.innerHTML, 'test');
    equal(node2.innerHTML, 'test2');
    equal(node3.innerHTML, 'test3');
    equal(node4.innerHTML, 'test4');
    v = new View(false, {
      $: jQuery
    });
    node = v.render({
      html: '<b>test</b>'
    });
    node2 = v.render('html', '<b>test2</b>');
    node3 = v.render(function() {
      return ['html', '<b>test3</b>'];
    });
    node4 = v.render(function() {
      return this.b('test4');
    });
    equal(node.html(), 'test');
    equal(node2.html(), 'test2');
    equal(node3.html(), 'test3');
    equal(node4.html(), 'test4');
    instance = new View(false, {
      render: function() {
        return jQuery(this.div('test'));
      }
    });
    equal(jQuery(instance)[0].innerHTML, 'test');
    instance = new View(false, {
      render: function() {
        return this.div(this.table(this.tbody(this.tr(this.td(this.ul(this.li(this.span(this.b('test'))), this.li(), [
          this.li(), [
            this.li(), this.li(), [
              this.li({
                "class": 'test',
                'value': 'value'
              })
            ]
          ]
        ])), this.td(this.p(this.span('test')))), this.tr(this.td(), this.td()))));
      }
    });
    equal(instance.$[0].firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.nodeValue, 'test');
    return equal(instance.$('li.test').html(), 'value');
  });
}).call(this);
