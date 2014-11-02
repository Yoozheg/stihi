(function(document, $, undefined){
 "use strict";

 $.rand = function(min, max){ //случайные целые числа
  if(!max) if(min > 0){max = min; min = 0}else max = 0;
  return Math.floor(Math.random() * (max - min)) + min;
 }

 $.randArbitary = function(min, max){ //случайные числа
  if(!min) min = 1;
  if(!max) if(min > 0){max = min; min = 0}else max = 0;
  return Math.random() * (max - min) + min;
 }

 $.rusform = function(k, form1, form2, form5, x){
  if(form1 instanceof Array){
   x = form2;
   form5 = form1[2];
   form2 = form1[1];
   form1 = form1[0];
  }
  
  var n = Math.abs(k) % 100, n1 = n % 10;
  if((n > 20 || n < 10) && n1>1 && n1 < 5) return x ? k + ' ' + form2 : form2;
  if(n != 11 && n1 == 1) return x ? k + ' ' + form1 : form1;
  return x ? k + ' ' + form5 : form5;
 }
 
 $.countdown = function(date, delay){
  var countdowns = [], startDate = date, currentDate = new Date(), diffDate; delay = (delay || 1);
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  if(currentDate >= startDate){
   diffDate = Math.floor((currentDate.getTime() - startDate.getTime())/(1000*60*60*24)); // разница в днях
   if(diffDate > 0){
    startDate = currentDate;
    startDate.setDate(startDate.getDate() + (delay - (diffDate % delay)));
   }
  }
  $(['.countdown']).each(function(){
   this.add('span'); // дни
   this.add('span'); // часы
   this.add('span'); // минуты
   this.add('span'); // секунды
  });
  setInterval(function(){ tick() }, 1000);
  tick();

  function tick(){
   var days,hours,minutes,seconds,current = new Date(), l = new Date(startDate.getTime() - current.getTime());
        days = Math.ceil(l.getTime()/(1000*60*60*24)); // разница в днях
       hours = l.getHours();//Math.floor(l/(1000*60*60)) - (days*24); // разница в часах
     minutes = l.getMinutes();//Math.floor(l/(1000*60)) - (hours*60); // разница в минутах (?)
     seconds = l.getSeconds();//Math.floor(l/(1000)) - (minutes*60); // разница в секундах (?)
   var count = [days, hours, minutes, seconds],
    rusforms = [['День','Дня','Дней'], ['Час','Часа','Часов'], ['Минута','Минуты','Минут'], ['Секунда','Секунды','Секунд']];

   $(['.countdown']).each(function(){ this.find(['span']).html(count) });
   for(var i = 1; i <= 4; ++i) $.css('.countdown span:nth-child('+i+'):after', 'content:"' + $.rusform(count[i - 1], rusforms[i-1])+'"'); // !
  }
 }
 
 $.client = { //инфо о клиенте
  width:function(){ return window.innerWidth ? window.innerWidth : helem && helem.clientWidth ? helem.clientWidth : undefined; },
  height:function(){ return window.innerHeight ? window.innerHeight : helem && helem.clientHeight ? helem.clientHeight : undefined; },
  scroll:function(){
   var html = document.documentElement, body = document.body, scrollTop = html.scrollTop || body && body.scrollTop || 0;
   scrollTop -= html.clientTop; // IE<8
   return scrollTop;
  }
 }
 
 $.splash = (function(){
  var splashScreen = (new $('div')).id('splash'), splashed = false, defaultParams = {prevClose:true}, splashCloseFunc;

  var splash = (function(){
   return {
    open: function(params){
     if(!params) params = {}
     for(var i in defaultParams) if(params[i] === undefined) params[i] = defaultParams[i];

     if(splashed && params.prevClose && splashCloseFunc) splashCloseFunc();
     splashCloseFunc = params.onclose;
     splashed = true;
     splashScreen.show()
    },
    close: function(){
     if(splashCloseFunc) splashCloseFunc();
     splashCloseFunc = undefined;
     splashed = false;
     splashScreen.hide()
    }
   }
  })()

  $.ready(function(){ $(document.body).add(splashScreen).on({click: splash.close}) });
  return splash;
 })()
 
 $.form = function(form, before, callback){
  var inputs = form.find(['input,select,textarea']), data = {};
  inputs.each(function(){data[this.name()] = this.val()});
  if(before) $.copy(data, before(form, inputs, data));
  $.ajax(data, 'server.php', callback ? callback(r) : function(r){ alert(r.responce) });
  return false;
 }
 
 $.slider = function(block, path){
  var l = path.start + path.count;
  block.css({width: block.data('width')+'px', height:block.data('height')+'px'});
  for(var i = path.start; i < l; ++i) block.add('div').css({backgroundImage:'url(' + path.before + i + path.after + ')'});
  block.find('div:nth-child(' + $.rand(path.start, l) + ')').show().addClass('showed');
  fn();
  
  function fn(){
   var img = block.find('.showed').removeClass('showed');
   img = img.get() == block.last().get() ? block.first() : img.next();
   img.addClass('showed');
   setTimeout(fn, 5000);
  }
 }
 
 $.gallery = function(block){
  var images = block.find(['figure[data-src]']);
  if(!images) return;
  images.on({click: function(e){
   $.splash.open({onclose: bigImgHide});
   bigImgShow(this.data('src'));
  }});
  
  function bigImgShow(src){ $('#splash').css({backgroundImage: 'url('+src+')'}) }
  function bigImgHide(){ $('#splash').css({backgroundImage: 'none'}) }
 }
})(document, $);
