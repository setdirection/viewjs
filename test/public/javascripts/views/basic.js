View.create({
  RouterView: [Router,{
    initialize: function(next){
      setTimeout(next,0);
    },
    render: function(){
      return this.tag('div',this.router);
    }
  }],
  BasicView: {
    $: jQuery,
    render: function(){
      return this.tag('div','test');
    }
  },
  TemplateView: {
    render: 'test.eco',
    defaults: {
      key: 'value'
    }
  },
  TextView: {
    render: function(){
      return this.tag('div','test')
    }
  }
});

$(function(){
  View({
    RouterView: function(){
      $('body').append(this);
      this.initialize(function(){});
    }
  })
});