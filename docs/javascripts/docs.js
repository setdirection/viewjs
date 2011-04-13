$(function(){
  console.log('!')
  try{
    Typekit.load();
  }catch(e){}
  $('.javascript').hide();
  $('#coffeescript').click(function(){
    $(this).toggleClass('active');
    $('.javascript').toggle();
    $('.coffeescript').toggle();
    return false;
  })
});