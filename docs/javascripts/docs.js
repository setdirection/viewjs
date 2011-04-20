$(function(){
  try{
    Typekit.load();
  }catch(e){}
  
  var sections = {
    intro: function(){
      return $("h1:contains('Intro')").add($("h1:contains('Intro')").nextUntil("h1:contains('Client')"));
    },
    client: function(){
      return $("h1:contains('Client')").add($("h1:contains('Client')").nextUntil("h1:contains('Server')"));
    },
    server: function(){
      return $("h1:contains('Server')").add($("h1:contains('Server')").nextUntil());
    }
  };
  var hide_sections = function(){
    for(var section_name in sections){
      sections[section_name]().hide();
    }
  };
  var current_section = false;
  var handlers = {
    intro: function(){
      hide_sections();
      sections.intro().show();
      $('#coffeescript,#api_quickview').hide();
      current_section = 'intro';
      show_coffeescript();
    },
    client: function(){
      hide_sections();
      sections.client().show();
      $('#coffeescript,#api_quickview').show();
      $('#coffeescript').html(coffeescript_active ? 'Show JavaScript' : 'Show CoffeeScript');
      $('#api_quickview').html(quickview_enabled ? 'Show Full Docs' : 'Show API Only');
      current_section = 'client';
    },
    server: function(){
      hide_sections();
      sections.server().show();
      $('#coffeescript,#api_quickview').show();
      $('#coffeescript').html(coffeescript_active ? 'Show JavaScript' : 'Show CoffeeScript');
      $('#api_quickview').html(quickview_enabled ? 'Show Full Docs' : 'Show API Only');
      current_section = 'server';
    }
  };
  for(var handler_name in handlers){
    $('#' + handler_name).click(handlers[handler_name]);
  }
  
  $('.javascript').hide();
  var coffeescript_active = true;
  var show_javascript = function(){
    $('.javascript').show();
    $('.coffeescript').hide();
  };
  var show_coffeescript = function(){
    $('.javascript').hide();
    $('.coffeescript').show();
  };
  var toggle_coffeescript = function(){
    coffeescript_active = !coffeescript_active;
    if(coffeescript_active){
      show_coffeescript();
    }else{
      show_javascript();
    }
  };
  $('#coffeescript').click(function(){
    toggle_coffeescript();
    $(this).html(coffeescript_active ? 'Show JavaScript' : 'Show CoffeeScript');
    return false;
  });
  
  var quickview_enabled = false;
  var toggle_quickview = function(){
    quickview_enabled = !quickview_enabled;
    $('#api_quickview').html(quickview_enabled ? 'Show Full Docs' : 'Show API Only');
    sections[current_section]().not('h1,h2,h3,h4').toggle();
    return false;
  };
  $('#api_quickview').click(toggle_quickview);
  
  handlers.intro();
});