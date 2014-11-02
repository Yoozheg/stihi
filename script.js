(function(window, document, $, undefined){
 "use strict";
 
 var counter = { // Дата для счётчика
  date : new Date(2014,9,8), // Год, Месяц-1, День (сейчас стоит 8 ноября 2014 года)
  delay: 5 // скрипт перезапускается каждые 5 дней, если установленная дата была ранее
 };
 
 window.slider = {before:'content/slides', after:'.jpg', start:1, count:3};
 
 $.ready(function(){
  var forms   = $(['form']),
    countdown = $(['.countdown']),
    animated  = $(['.animated']),
    splash    = $(['.button']),
    numbers   = $('.numbers'),
    gallery   = $('.gallery'),
    slideShow = $('.slider');

  if(gallery)   $.gallery(gallery);
  if(countdown) $.countdown(counter.date, counter.delay);
  if(slideShow) $.slider(slideShow, window[slideShow.data('content')]);
  if(splash)    splash.on({click: function(event){ $.splash.open({onclose: hidePopup}); showPopup() }});
  if(forms)     forms .on({submit: sendForm});
  
  window.onscroll = function(){
   var top = window.pageYOffset || document.documentElement.scrollTop, height = $.client.height(), pos = top+height/2.1;
   if(numbers && pos > numbers.coords().top) numbers.find(['p span']).each(function(){increment(this)});
   if(animated) animated.each(function(){ (pos > this.coords().top) ? this.addClass('scroll') : this.removeClass('scroll') });
   
   function increment(e){
    var need = parseInt(e.data('content')), current = parseInt(e.html());
    if(current < need) e.html(++current);
    if(current < need) setTimeout(function(){increment(e)}, 2500/need);
   }
  }
 });
 
 function showPopup(){ $('#hided').show() }
 function hidePopup(){ $('#hided').hide() }
 function sendForm(event){ return $.form(this) }
})(window, document, $);
