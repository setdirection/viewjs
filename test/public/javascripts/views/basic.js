View.create({
  RouterView: [Router,{
    initialize: function(next){
      setTimeout(next,0);
    },
    render: function(){
      return this.tag('div',this.Router);
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

View.extend({
  helpers: {
    test: function(params){
      return '<p>' + params.key + '</p>';
    },
    test2: function(params){
      return Builder.p(params.key);
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