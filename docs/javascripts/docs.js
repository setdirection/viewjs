$(function(){
  var content_to_hide = $('p,h1,h2,h3,pre,ul',$('#main')).not('p:first,#nav');
  content_to_hide.hide();
  $('p:first').addClass('intro');
  $('pre').addClass('highlighted');
  $('code').addClass('javascript');
  dp.sh.HighlightAll('javascript',false,false,false,true,false);
  var first_api_method = 'viewfunction_constructor_object_methods__classviewclass_parent_functionelement_object_methods__class';
  $('#' + first_api_method).nextUntil('h2,h3').add('#' + first_api_method).clone().show().appendTo('#api_example');
  $('#api_example').html($('#api_example').html().replace(/-&gt;/g,'<b>&rarr;</b>'))
  $.routes(function(hash){
    $('#nav a').removeClass('active');
    if(hash == '' || !hash){
      hash = 'api';
    }
    if(hash == 'intro'){
      $('#nav a[href="#intro"]').addClass('active');
      content_to_hide.hide();
      $('#api_toc').hide();
      $('#jquery_view').nextUntil('#class_creation').show();
    }else if(hash == 'guide'){
      $('#nav a[href="#guide"]').addClass('active');
      content_to_hide.hide();
      $('#api_toc').hide();
      $('#class_creation').nextUntil('#class').add('#class_creation').show();
    }else if(hash == 'api'){
      $('#nav a[href="#api"]').addClass('active');
      content_to_hide.hide();
      $('#api_toc').show();
    }else if(hash == 'resources'){
      $('#nav a[href="#resources"]').addClass('active');
      content_to_hide.hide();
      $('#api_toc').hide();
      $('#resources').nextUntil('#api_toc').show();
    }else{
      $('#nav a[href="#api"]').addClass('active');
      $('#api_example').empty();
      $('#' + hash).nextUntil('h2,h3').add('#' + hash).clone().show().appendTo('#api_example');
      $('#api_example').html($('#api_example').html().replace(/-&gt;/g,'<b>&rarr;</b>'))
    }
  });
});
