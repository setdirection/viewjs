var ArgumentsTestView = view(function(){
  return this.ul(
    this.li('one','two',this.b('three'),'four',this.b('five')),
    this.li({className: 'test'}),
    {className: 'blarg'}
  );
});

var DeepView = view(function(){
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

test("Builder can output strings",function(){
  var a = new DeepView();
  equal(a.element(),'<div><table><tbody><tr><td><ul><li><span><b>test</b></span></li><li /><li /><li /><li /><li /></ul></td><td><p><span>test</span></p></td></tr><tr><td /><td /></tr></tbody></table></div>');
  equal(a.toString(),a.element());
  var b = new ArgumentsTestView();
  equal(b.element(),'<ul class="blarg"><li>onetwo<b>three</b>four<b>five</b></li><li class="test" /></ul>');
});