(function() {
  test('Class and inheritance', function() {
    var ViewA, ViewB, instance;
    console.log('a');
    instance = new View(false, {
      echo: function(b) {
        return this.a + b;
      }
    });
    console.log('b');
    instance.a = 'a';
    equal(instance.echo('b'), 'ab');
    console.log('c');
    ViewA = View({
      c: 'c',
      echo: function(b) {
        return this.a + b;
      }
    });
    console.log('ViewA', ViewA);
    instance = new ViewA;
    instance.a = 'a';
    equal(instance.echo('b'), 'ab');
    console.log('build ViewB');
    console.log('-----------');
    ViewB = View(ViewA, {
      echo: function(_b) {
        return '1' + ViewA.prototype.echo.call(this, _b) + this.c;
      }
    });
    console.log('-----------');
    console.log('built ViewB');
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
    });
    ViewWithBefore.before({
      echo: function(args, next) {
        return next(args[0].toUpperCase(), '');
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
    instance = new View({
      $: jQuery,
      render: function() {
        return this.div({
          "class": 'test'
        });
      }
    });
    instance2 = new View({
      $: jQuery,
      render: ['html', '<div class="test"></div>']
    });
    instance3 = new View({
      $: jQuery,
      render: function() {
        return ['html', '<div class="test"></div>'];
      }
    });
    equal(instance.$[0].className, 'test');
    equal(instance2.$[0].className, 'test');
    equal(instance3.$[0].className, 'test');
    v = new View;
    node = v.render({
      html: '<b>test</b>'
    });
    node2 = v.render('html', '<b>test</b>');
    node3 = v.render(function() {
      return ['html', '<b>test</b>'];
    });
    node4 = v.render(function() {
      return this.b('test');
    });
    equal(node.innerHTML, 'test');
    equal(node2.innerHTML, 'test');
    equal(node3.innerHTML, 'test');
    equal(node4.innerHTML, 'test');
    v = new View({
      $: jQuery
    });
    node = v.render({
      html: '<b>test</b>'
    });
    node2 = v.render('html', '<b>test</b>');
    node3 = v.render(function() {
      return ['html', '<b>test</b>'];
    });
    node4 = v.render(function() {
      return this.b('test');
    });
    equal(node.html(), 'test');
    equal(node2.html(), 'test');
    equal(node3.html(), 'test');
    equal(node4.html(), 'test');
    instance = new View({
      render: function() {
        return jQuery(this.div('test'));
      }
    });
    equal(jQuery(instance)[0].innerHTML, 'test');
    instance = new View({
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
