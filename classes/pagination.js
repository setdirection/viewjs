/* PaginationView
 * ==============
 *   
 * Properties
 * ----------
 * - items (required) -> Array
 * - items_per_page -> Number
 * - page -> Number
 * - total_pages -> Number
 * 
 * Methods
 * -------
 */
PaginationView = $.view(function(){
  this.bind('change:items',this.onItemsChange);
  this.bind('change:page',this.onPageChange);
  this.element(
    this.div({className:'pagination'},
      $(this.a({className:'next',href:'#'})).click(this.nextPage),
      this.pagesElement = this.ul(), //li's generated by onItemsChange
      $(this.a({className:'previous',href:'#'})).click(this.previousPage)
    )
  );
  if(!this.get('page')){
    this.set('page',1);
  }
  if(!this.get('items_per_page')){
    this.set('items_per_page',10);
  }
},{
  /* ### instance.next*() -> null*
   */ 
  next: function(){
    if(this.get('page') == 1){
      return false;
    }
    this.set('page',this.get('page') - 1);
    return false;
  },
  /* ### instance.previous*() -> null*
   */ 
  previous: function(){
    if(this.get('page') == this.get('total_pages')){
      return false;
    }
    this.set('page',this.get('page') + 1);
    return false;
  },
  /* ### instance.range*() -> Array*
   */ 
  range: function(){
    return this.get('items').slice((this.get('items_per_page') * (this.get('page') - 1)),(this.get('items_per_page') * this.get('page')));
  },
  onItemsChange: function(items){
    this.listItemsByPage = {};
    $(this.pagesElement).empty();
    var total_pages = Math.ceil(items.length / this.get('items_per_page'));
    for(var i = 0; i < total_pages; ++i){
      (function(view,i){
        var page = i + 1;
        var link = view.a({href:'#'},view.span(page));
        $(link).click(view.callback('set','page',page));
        view.listItemsByPage[page] = view.li(link);
        view.pagesElement.insertBefore(view.listItemsByPage[page],view.pagesElement.firstChild);
      })(this,i);
    }
    this.set('total_pages',total_pages);
    this.set('page',1);
  },
  onPageChange: function(page){
    $('li a',this).removeClass('active');
    $('a',this.listItemsByPage[page]).addClass('active');
  }
});