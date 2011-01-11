jQuery View
===========
Markup as JavaScript **[Development](https://github.com/syntacticx/viewjs/zipball/master) | [Production (6KB)](https://github.com/syntacticx/viewjs/raw/master/jquery.view.min.js)**  

<ul id="nav">
  <li><a href="#intro">Intro</a></li>
  <li><a href="#guide">Guide</a></li>
  <li><a href="#api">API</a></li>
  <li><a href="#changelog">Change Log</a></li>
</ul>
<br class="clear"/>

jQuery View provides a class and inheritance system for templates which can be constructed with a mix of pure JavaScript, HTML strings, Mustache/jQuery templates and jQuery objects:

    ListView = $.view(function(){
      return this.ul(
        this.li('Item One'),
        $(this.li('Item Two')).click(this.handleClick),
        "<li>{{key}}</li>"
      );
    },{
      handleClick: function(event){}
    });

View instances can be used as arguments to jQuery:

    var instance = new ListView({key:'Item Three'});
    $('li:first',instance).addClass('first');
    $(instance).appendTo('body');
