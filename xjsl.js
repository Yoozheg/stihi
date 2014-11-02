(function(window, document, helem, browser, dist, undefined){
 "use strict";
 var $ = (function(){ //core
  var _$ = window.$,
  $ = function(){ //arguments
   var context = document, param = Array.prototype.slice.call(arguments);
   if(this !== window && this !== undefined){
    if(this.element || this.nodeType){
     context = (this.element ? this.element : this);
    }else{
     if(arguments.length > 1){
      param = [document.createDocumentFragment()];
      for(var i = 0; i < arguments.length; ++i){
       param[0].appendChild(create(arguments[i]))
      }
     }else param = [create(arguments[0])];
    }
   }
   if(!param[0]) return undefined;
   var wrap = new $.DOM.init(param[0], context);
   for(var i = 1; i < param.length; ++i){
    var f = new $.DOM.init(param[i], context);
    if(f.get()) wrap.concat(f);
   }
   if(wrap instanceof Array && !wrap.element[0]) wrap.element.shift();
   return wrap.get() ? wrap : undefined;
  };

  $.settings = {};

  $.DOM = $.prototype = {
   constructor: $,
   params:{},
   init:function(e, context){
    if(e.element !== undefined){ //и так объект в обёртке
     this.element = e.element;
     return;
    }
    this.element = typeof e !== "object" ? context.querySelector(e) :
     ((e instanceof Array || e instanceof NodeList || e instanceof HTMLCollection) ? Array.prototype.slice.call(typeof e[0] === "string" ? context.querySelectorAll(e[0]) : e) : e.nodeType ? e : undefined);
   },
   length:function(){
    var elements = this.get();
    return elements ? (elements instanceof Array ? elements.length : 1) : 0;
   },
   get:function(q){
    return (this.element == undefined || this.element == null || (this.element instanceof Array && this.element.length === 0))
     ? false : (this.element instanceof Array && q != undefined) ? this.element[q] : this.element;
   },
   q:function(index){return $(this.get(index))},
   filter:function(fn){
    var result = [];
    for (var i = 0, l = this.element.length; i < l; ++i){
     if(i in this.element && fn.call($(this.element[i]), i)){
      result.push(this.element[i]);
     }
    }
    if(result.length === 0) return undefined;
    if(result.length === 1) result = result[0];
    this.element = result;
    return this;
   },
   concat:function(selector){
    var tail = $(selector).get();
    if(this.element instanceof Array){
     tail instanceof Array ? this.element = this.element.concat(tail) : this.element.push(tail);
    }else{
     this.element = (tail instanceof Array ? [this.element].concat(tail) : [this.element, tail]);
    }
    return this;
   },
   find:function(){
    return this.map(function(args){
     return $.apply(this, args);
    }, arguments)
   },
   parent:function(){return this.map(function(){return $(this.get().parentNode)})},
   self:function(){}, //возвращает общего родителя
   each:function(func, params, init){
    var tmp;
    if(this.element instanceof Array){
     for(var i = 0; i < this.element.length; ++i){
      tmp = params instanceof Array ? params[i] : params;
      if(init) tmp = init(tmp, i);
      func.call(this.q(i), tmp, i);
     }
    }else{
     tmp = init ? init(params, 0) : params;
     func.call($(this.element), tmp, 0);
    }
    return this;
   },
   map:function(func, params, init){
    var tmp;
    if(this.element instanceof Array){
     var result = [];
     for(var i = 0; i < this.element.length; ++i){
      tmp = params instanceof Array ? params[i] : params;
      if(init) tmp = init(tmp, i);
      result.push(func.call($(this.element[i]), tmp, i));
     }
     return result;
    }else{
     tmp = init ? init(params, 0) : params;
     return func.call($(this.element), tmp, 0);
    }
   },
   some:function(fn){
    if(!(this.element instanceof Array)) return fn.call(this.element, 0);
    for(var i = 0, l = this.element.length; i < l; ++i){
     if(i in this.element && fn.call(this.q(i), i)){
      return true;
     }
    }
    return false;
   },
   /**
    * Возвращает true, если fn для каждого элемента массива вернула истинное значение. Вызов fn аналогичен {@link #forEach}.
    * @param {Function} fn Boolean-функция.
    * @return {Boolean}
    */
   every:function(fn){
    if(!(this.element instanceof Array)) return fn.call(this.element, 0);
    for(var i = 0, l = this.element.length; i < l; ++i){
     if(i in this.element && !fn.call(this.q(i), i)){
      return false;
     }
    }
    return true;
   }
  }
  $.DOM.init.prototype = $.DOM;

  $.DOM.html = function(html){return html != undefined ? this.each(function(html){this.get().innerHTML = html}, html) : this.map(function(){return this.get().innerHTML})}
  $.DOM.id = function(id){return id != undefined ? this.each(function(id){this.get().id = id}, id) : this.map(function(){return this.get().id})}
  $.DOM.name = function(name){return name != undefined ? this.each(function(name){this.get().name = name}, name) : this.map(function(){return this.get().name})}
  $.DOM.text = function(text){return text != undefined ? this.each(function(text){this.clear().add(document.createTextNode(text))}, text) : this.map(function(){return this.get().textContent})}
  $.DOM.cls = function(clsName){return clsName != undefined ? this.each(function(clsName){this.get().className = clsName}, clsName) : this.map(function(){return this.get().className})}
  $.DOM.val = function(value){
   return value != undefined
    ? this.each(function(value){this.attr({value:value}).get().value = value}, value)
	: this.map(function(){
	   var e = this.get();
	   return e.type === 'file'
        ? (e.files.length > 0 ? (e.files.length == 1 ? e.files[0] : e.files) : undefined)
	    : (e.type == 'checkbox' ? e.checked : (e.value || e.getAttribute('value')));
	})}
  $.DOM.validate = function(){return this.map(function(){return this.get().checkValidity()})}
  $.DOM.css = function(style){
   return style != undefined ? this.each(function(style){
    var e = this.get();
    typeof style === "string" ? (style.length > 0 ? e.setAttribute('style', style) : e.removeAttribute('style')) : $.copy(e.style, style);
   }, style) : this.attr('style');
  }
  $.DOM.data = function(key, value){
   if(value === undefined && typeof key == "object" && !(key instanceof Array)){
    var tmp = [];
    value = [];
    for(var i in key){
     tmp.push(i);
     value.push(key[i])
    }
    key = tmp;
   }
   return value != undefined ? this.each(function(params){
    var el = this.get();
    if(el.dataset){
     key = $.toCamelCase(key);
     el.dataset[key] = value;
    }else{
     key = $.toDash(key);
     el.setAttribute(key, value);
    }
   }, {key:key, value:value}) : this.map(function(params){
    var el = this.get();
    if(el.dataset){
     key = $.toCamelCase(key);
     return el.dataset[key];
    }else{
     key = $.toDash(key);
     return el.getAttribute('data-'+key);
    }
   }, key);
  }
  $.DOM.attr = function(attr, value){
   if(value === undefined && typeof attr == "object" && !(attr instanceof Array)){
    var tmp = [];
    value = [];
    for(var i in attr){
     tmp.push(i);
     value.push(attr[i])
    }
    attr = tmp;
   }
   return value != undefined ? this.each(function(params){
    var o = this.get();
    if(!(params.attr instanceof Array)) params = {attr: [params.attr], value: [params.value]}
    for(var i = 0; i < params.attr.length; ++i) params.value[i] == null ? o.removeAttribute(params.attr[i]) : o.setAttribute(params.attr[i], params.value[i]);
   }, {attr:attr, value:value}) : this.map(function(attr){return this.get().getAttribute(attr)}, attr);
  }
  $.DOM.has = function(attr){return this.map(function(attr){return this.get().hasAttribute(attr)}, attr)}
  $.DOM.rmAttr = function(attr){return this.map(function(attr){var e = this.get(), res = []; for(var i = 0; i < attr.length; ++i){res.push(e.getAttribute(attr[i]));e.removeAttribute(attr[i])} return res}, attr)}
  $.DOM.add = function(e){return this.map(function(e){return $(this.get().appendChild(e.nodeType ? e : e.get()))},  typeof e == "object" ? e : create(e))}
  $.DOM.prep = function(e){return this.map(function(e){return $(this.get().insertBefore(e.nodeType ? e : e.get(), this.get().firstChild))},  typeof e == "object" ? e : create(e))}
  $.DOM.addText = function(text){return this.each(function(text){this.add(document.createTextNode(text))}, text)}
  $.DOM.prepText = function(text){return this.each(function(text){this.prep(document.createTextNode(text))}, text)}
  $.DOM.after = function(node){
   return this.map(function(node){
    node = new $(node);
    var referenceNode = this.get(), parent = referenceNode.parentNode;
    parent.insertBefore(node.get(), referenceNode.nextSibling);
    return node;
   }, node);
  }
  $.DOM.before = function(node){
   return this.map(function(node){
    node = new $(node);
    var referenceNode = this.get(), parent = referenceNode.parentNode;
    parent.insertBefore(node.get(), referenceNode);
    return node;
   }, node);
  }
  $.DOM.addClass = function(c){
   return this.each(function(c){
    if(!this.hasClass(c)){
     var o = this.get();
     o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
    }
   }, c);
  }
  $.DOM.hasClass = function(c){
   return this.map(function(c){
    return (new RegExp("(^|\\s)" + c + "(\\s|$)", "g")).test(this.get().className)
   }, c);
  }
  $.DOM.removeClass = function(c){
   return this.each(function(c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g"), o = this.get();
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
   }, c);
  }
  $.DOM.toggleClass = function(c){
   return this.each(function(c){
    this.hasClass(c) ? this.removeClass(c) : this.addClass(c);
   }, c);
  }
  $.DOM.onceClass = function(c){
   return this.each(function(c){
    var nodes = this.parent().find('.' + c);
    if(nodes) nodes.removeClass(c);
    this.addClass(c);
   }, c);
  }
  $.DOM.hide = function(){return this.each(function(){hide(this.get())})}
  $.DOM.show = function(){return this.each(function(){show(this.get())})}
  $.DOM.toggle = function(){return this.each(function(){var e = this.get(); isHidden(e) ? show(e) : hide(e)})}
  $.DOM.hidden = function(){return this.map(function(){return isHidden(this.get())})}
  $.DOM.clear = function(n){return this.each(n ? function(n){var t = this.find([n]);if(t) t.rm()} : function(){var t = this.get();while(t.childNodes.length) t.removeChild(t.childNodes[0])}, n)}
  $.DOM.rm = function(){
   return this.map(function(){
    var o = this.get();
    o.parentNode.removeChild(o);
    return $(o);
   })
  }
  $.DOM.remove = function(){
   return this.map(function(){
    var o = this.get(), p = o.parentNode;
    p.removeChild(o);
    return $(p);
   })
  }
  $.DOM.first = function(){return this.map(function(){return $(this.get().firstElementChild)})}
  $.DOM.last = function(){return this.map(function(){return  $(this.get().lastElementChild)})}
  $.DOM.next = function(){return this.map(function(){return $(this.get().nextElementSibling)})}
  $.DOM.prev = function(){return this.map(function(){return $(this.get().previousElementSibling)})}
  $.DOM.neighbours = function(node){return this.map(function(node){var o = this.get();return o.nextElementSibling == node || o.previousElementSibling == node}, node)}    
  $.DOM.child = function(){return this.map(function(){return $(this.get().children)})}
  $.DOM.on = function(eventInfo){return this.each(function(params){for(var i in params) Event.append(this.get(), i, params[i])}, eventInfo)}
  $.DOM.off = function(eventInfo){
   return this.each(function(params){
    if(typeof params === "object" && !(params instanceof Array)){for(var i in params) Event.remove(this.get(), i, params[i])}
    if(typeof params === "string"){params = params.split(/\s+/)}
    if(typeof params === "object" && params instanceof Array){for(var i = 0; i < params.length; ++i){Event.remove(this.get(), params[i])}}
    if(params == null || params === undefined){Event.remove(this.get())}
   }, eventInfo)}
  $.DOM.serialize = function(offset){
   offset = offset || ' ';
   return this.map(function(){
    var o = this.get();
    if(o.outerHTML) return o.outerHTML;
    var nodeName = o.nodeName, html = '', s = '<'+nodeName;
    for(var i = 0; i < o.attributes.length; ++i){
     var attr = o.attributes.item(i);
     s += ' ' + attr.name + '="' + attr.text + '"';
    }
    if(o.innerHTML) html = o.innerHTML; else if(o.childNodes.length) html = $(o.childNodes).serialize(offset+' ').join('\n'+offset);
    return html ? s+'>\n'+offset+html+'\n'+offset.substr(1)+'</'+nodeName+'>' : s+' />';
   });
  }
  $.DOM.bounds = function(){return this.map(function(){return this.get().getBoundingClientRect()})}
  $.DOM.coords = function(){
   return this.map(function(){
    var box = this.get().getBoundingClientRect(), body = document.body, docElem = document.documentElement,
    scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
    scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
    clientTop = docElem.clientTop || body.clientTop || 0,
    clientLeft = docElem.clientLeft || body.clientLeft || 0,
    top  = box.top +  scrollTop - clientTop,
    left = box.left + scrollLeft - clientLeft;
    return {left: Math.round(left), top: Math.round(top)}
   })
  }
  $.DOM.computedStyle = function(prop){return this.map(window.getComputedStyle ? function(prop){return getComputedStyle(this.get())[prop]} : function(prop){return getIEComputedStyle(this.get(), prop)}, prop)}
  $.DOM.animate = function(params, type, duration, callback){
   var counter = 0, element = this, ease, modifer, queue = true, eases = {
    linear:function(progress){return progress},
    quad:function(progress){return Math.pow(progress, 2)},
    quint:function(progress){return Math.pow(progress, 5)},
    circ:function(progress){return 1 - Math.sin(Math.acos(progress))},
    back:function(progress){return Math.pow(progress, 2) * ((1.5 + 1) * progress - 1.5)},
    elastic:function(progress){return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*1.5/3*progress)},
    bounce:function(progress){for(var a = 0, b = 1, result; 1; a += b, b /= 2){if (progress >= (7 - 4 * a) / 11){return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)}}}
   }, modifers = {
    easeInOut:function(delta){return function(progress){return progress < .5 ? (delta(2*progress) / 2) : ((2 - delta(2*(1-progress))) / 2)}},
    easeOut:function(delta){return function(progress){return 1 - delta(1 - progress)}},
    easeIn:function(delta){return delta}
   }
   for(var i in type){modifer = "ease"+i;ease = type[i]}
   if(params.hasOwnProperty('queue')){queue = params.queue;params.queue = null}
   if(this.params.animate === undefined || this.params.animate.status === false || !queue){
    startAnimation();
    if(queue){this.params.animate = {status: true, queue: []}}
   }else this.params.animate.queue.push(startAnimation);
   function startAnimation(){element.map(lambda, params, function(params, index){return {props:params, duration:duration, delta:ease, modifer:modifer}})}
   function lambda(params){
    for(var i in params.props){
     var start = this.computedStyle(i), dims = new RegExp(/\D+$/).exec(start);
     if(dims == ")"){ //color
      start = start.match(/0?\.?\d+/g);
      for(var j = 0; j < start.length; ++j) start[j] = parseFloat(start[j]);
      if(params.props[i].length < start.length) params.props[i].push(start[start.length-1]);
      if(params.props[i].length > start.length) start.push(1);
     }else start = parseFloat(start);
     if(start != undefined){
      var opts = {start:start, end:params.props[i], prop:i, dims:dims, duration:params.duration, elem:this.get(), delay: 40}
      animateProp(opts);
     }
    }
   }
   function animateProp(opts){
    var start = opts.start, end = opts.end, prop = opts.prop;
    opts.step = function(delta){
     if(start instanceof Array){
      var value=[];
      for(var i = 0; i < start.length; ++i){
       value.push(start[i] + (end[i] - start[i]) * delta);
       if(i < 3) value[i] = Math.round(value[i]); //rgb
      }
      opts.elem.style[prop] = (start.length == 4 ? "rgba" : "rgb") +'('+value+')';
     }else{
      var value = start + (end - start) * delta;
      if(prop != "opacity") value = Math.round(value);
      opts.elem.style[prop] = value + (opts.dims || "");
     }
    }
    return animation(opts);
   }
   function animation(opts){
    var start = new Date, delta = typeof delta == "function" ? delta : (eases[opts.delta || "linear"]), modifer = modifers[opts.modifer || "easeIn"], frame = function(){
     var progress = (new Date - start) / opts.duration;
     if(progress > 1) progress = 1;
     opts.step(modifer(delta(progress)));
     if(progress == 1){
      if(--counter == 0){
       if(callback) callback.call(element);
       if(queue){
        if(element.params.animate.queue.length === 0){
         element.params.animate.status = false;
        }else{(element.params.animate.queue.shift())()}
       }
      }
     }else{
      setTimeout(frame, opts.delay);
     }
    };
    frame()
    ++counter;
   }
   return this;
  }
  $.DOM.compare = function(node){return this.map(function(node){ return this.get().compareDocumentPosition(node)}, node)}
  $.DOM.contains = function(node){return this.map(function(node){ return this.get().compareDocumentPosition(node) & 16}, node)}
  $.DOM.contained = function(node){return this.map(function(node){ return this.get().compareDocumentPosition(node) & 8}, node)}
  $.DOM.load = function(addr, text){this.map(function(param){var elem = this;$.ajax(param.text, param.addr, function(r){elem.html(r)}, false)}, {addr:addr, text:text})}
  $.DOM.dragdrop = function(handler, parent){
   return this.each(function(parent){
    parent = $(parent || document.body);
    var drag = false, position, posOnPage, oldFunc;
     this.off("mousedown mousemove mouseout mouseup").on({mousedown:start, mouseup:stop, mouseout:stop, mousemove:move});
     function start(e){
      position = {left: e.offsetX, top: e.offsetY};
      posOnPage = {left: e.pageX, top: e.pageY};
      document.ondragstart = document.body.onselectstart = function(){return false}
      drag = true;
      return false;
     }
     function stop(e){drag = false}
     function move(e){if(drag) handler.call(this, {left: e.pageX, top: e.pageY}, parent.coords(), position, e, posOnPage)}
   }, parent)
  }
  $.DOM.clone = function(){return this.map(function(){return $(this.get().cloneNode(true))})}
  $.DOM.replace = function(elem){return this.each(function(elem){var node = this.get(), parent = node.parentNode;parent.replaceChild($(elem).get(), node)}, elem)}

  $.ready = function(handler){
   if(!readyList.length) bindReady(function(){ for(var i=0; i < readyList.length; ++i) readyList[i]() })
   readyList.push(handler);
   return this;
  }
  $.cookie = function(name, value, props){
   if(!value && !props){
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
   }
   props = props ||{};
   var exp = props.expires;
   if(typeof exp == "number" && exp){
    var d = new Date();
    d.setTime(d.getTime() + exp*1000);
    exp = props.expires = d;
   }
   if(exp && exp.toUTCString){props.expires = exp.toUTCString()}
   value = encodeURIComponent(value);
   var updatedCookie = name + "=" + value;
   for(var propName in props){
    updatedCookie += "; " + propName;
    var propValue = props[propName];
    if(propValue !== true) updatedCookie += "=" + propValue;
   }
   document.cookie = updatedCookie;
   return this
  }
  $.storage = function(item, value){ //item, value - строки; если итем - число, то вернёт название ключа, если итем == -1 - очистит хранилище, нет параметров - длина
   var storage = (window.localStorage||window.globalStorage);
   if(!item && !value) return storage.length;
   if(typeof item == "number"){
    if(item === -1){
     storage.clear();
     return this;
    }
    item = storage.key(item);
    return item;
   }
   if(value === undefined) return storage.getItem(item);
   if(value == null){
    storage.removeItem(item);
    return this;
   }
   storage.setItem(item,value);
   return this;
  }
  $.ajax = function(text, addr, callback, params){
   var req = ($.parseURL(addr).host === dist.hostname) ? new XMLHttpRequest() : (function(XHR){return new XHR()})(window.XDomainRequest || window.XMLHttpRequest);
   var defaultParams = {method: text ? "post" : "get", json: true, async: true};
   if(!params) params = {};
   for(var key in defaultParams) if(params[key] === undefined) params[key] = defaultParams[key];
   params.method = (params.method || (text ? "post" : "get")).toLowerCase();
   if(text !== undefined && typeof text !== "string"){
    if(params.method === "post"){
    var res = new FormData();
     for(var f in text){
      if(typeof text[f] === "object" && text[f] instanceof Array){
       for(var i = 0; i < text[f].length; ++i) res.append(f, text[f][i]);
      }else res.append(f, text[f]);
     }
     text = res;
    }else text = $.toQueryString(text); // get
   }
   if(params.method === "get" && text) addr += "?" + text;
   req.open(params.method, addr, params.async);
   $.xcrft(req, {type: params.method, url: addr});
   req.send(params.method === "get" ? null : text);
   if(params.async && callback) req.onload = function(){callback.call(null, params.json ? JSON.parse(req.responseText) : req.responseText)}
   if(!params.async && req.status === 200){return params.json ? JSON.parse(req.responseText) : req.responseText}
   return this;
  }
  $.xcrft = function(xhr, settings){
   function sameOrigin(url){
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/')
      || (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/')
      || !(/^(\/\/|http:|https:).*/.test(url));
   }
   function safeMethod(method){ return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method)) }
   if(!safeMethod(settings.type) && sameOrigin(settings.url)) xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
  }
  $.proxy = function(func, context /*, args*/){ //Синтаксис: (func, context, аргументы) или (obj, 'method', аргументы)
   var args = [].slice.call(arguments, 2);
   if(typeof context === "string"){ 
    args.unshift(arguments[1], arguments[0]); 
    return bind.apply(this, args); 
   }
   return function(){
    var unshiftArgs = args.concat([].slice.call(arguments));
    return func.apply(context, unshiftArgs);
   }
  }
  $.copy = function(dst){
   for(var i = 1; i < arguments.length; ++i){
    var obj = arguments[i];
    for(var key in obj){
     dst[key] = obj[key];
    }
   }
   return dst;
  }
  $.esc = function(string){ return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;')}
  $.trim = function(string){return string.replace(/^\s+|\s+$/g, "")}
  $.toCamelCase = function(string){return string.replace(/((\-|_)[a-z])/g, function($1){return $1.toUpperCase().replace(/\-|_/,'')})}
  $.toDash = function(string){return string.replace(/([A-Z]|_[A-Za-z])/g, function($1){return "-"+$1.replace('_','').toLowerCase()})}
  $.toUnderscore = function(string){return string.replace(/([A-Z]|\-[a-z])/g, function($1){return "_"+$1.replace('-','').toLowerCase()})}
  $.toQueryString = function(obj, prefix){
   var str = [];
   for(var p in obj){
    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
    str.push(typeof v == "object" ? $.toQueryString(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
   }
   return str.join("&");
  }
  $.parseURL = function(url){
   var a =  document.createElement('a');
   a.href = url;
   return {
    source: url,
    protocol: a.protocol.replace(':',''),
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function(){
     var ret = {}, seg = a.search.replace(/^\?/,'').split('&'), len = seg.length, i = 0, s;
     for(;i<len;i++){
      if(!seg[i]) continue;
      s = seg[i].split('=');
      ret[s[0]] = s[1];
     }
     return ret;
    })(),
    file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
    hash: a.hash.replace('#',''),
    path: a.pathname.replace(/^([^\/])/,'/$1'),
    relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
    segments: a.pathname.replace(/^\//,'').split('/'),
    hashSegments: a.hash.replace('#','').split('/')
   };
  }
  $.indexOf = function(object, array){
   for(var i = 0, l = array.length; i < l; ++i){
    if(i in array && array[i] === object) return i;
   }
   return -1;
  }
  $.delay = function(f, ms){
   return function(){
    var savedThis = this, savedArgs = arguments;
    setTimeout(function(){f.apply(savedThis, savedArgs)}, ms);
   }
  }
  $.repeat = function(fn, delay, ctx){
   var timer;
   function f(){
    if(timer) clearTimeout(timer);
    fn.apply(ctx);
    timer = setTimeout(f, delay);
   }
   f();
   return f;
  }
  $.bounce = function(fn, delay, ctx){ //Возвращает функцию, вызывающую исходную с задержкой delay в контексте ctx. Если во время задержки функция была вызвана еще раз, то предыдующий вызов отменяется, а таймер обновляется. Таким образом из нескольких вызовов, совершающихся чаще, чем delay, реально будет вызван только последний.
   var timer;
   return function(){
    var args = arguments, that = this;
     clearTimeout(timer);
     timer = setTimeout(function(){
      fn.apply(ctx || that, args);
     }, delay);
   }
  }
  $.debounce = function(f, ms){ //передаёт вызов f не чаще, чем раз в ms миллисекунд
   var state = null, COOLDOWN = 1;
   return function(){
    if (state) return;
    f.apply(this, arguments);
    state = COOLDOWN;
    setTimeout(function(){state = null}, ms);
   }
  }
  $.throttle = function(f, ms){ //возвращает обёртку, передающую вызов f не чаще, чем раз в ms миллисекунд. если игнорируемый вызов оказался последним — то он выполнится
   // одно из трёх состояний
   var state = null;        // исходное, "нулевое состояние"
   var COOLDOWN = 1;        // был вызов, ожидаю пока пройдёт таймаут
   var CALL_SCHEDULED = 2;  // во время COOLDOWN был ещё вызов, он запланирован на выполнение по окончании таймаута
   var scheduledThis, scheduledArgs;   // чтобы запланировать вызов, мы сохраняем его this и arguments
   function callF(){f.apply(scheduledThis, scheduledArgs)}
   // переход между состояниями
   // изначально нулевое -  при этом тут же вызывается функция и переходим в COOLDOWN
   // если во время COOLDOWN вызов, то переходим в CALL_SCHEDULED с сохранением аргументов
   // если во время CALL_SCHEDULED вызов, то обновим сохранённые аргументы
   return function(){
    switch(state){
     case null:
      f.apply(this, arguments);
      state = COOLDOWN;
      setTimeout(later, ms);
     break;
     case COOLDOWN:
     case CALL_SCHEDULED:        
      scheduledThis = this;
      scheduledArgs = arguments;
      state = CALL_SCHEDULED;
     break;
    }
   }
   function later(){
    if(state == COOLDOWN){
     state = null;
     return;
    }
    if(state == CALL_SCHEDULED){
     callF();
     state = COOLDOWN; // вызов только что был, переход в COOLDOWN, чтобы обеспечить паузу до следующего 
     setTimeout(later, ms);
    }
   }
  }

  $.js = function(path){
   var scripts = $(["script"]), ref;
   if(scripts && scripts.some(function(){return this.attr('src') === path})) return;
   $(helem).add((new $("script")).attr({type:"text/javascript", async:true, src:path}));
   return this;
  }
  $.css = function(selector, style){
   if(!document.styleSheets || !helem) return;
   var styleSheet, mediaType;
   if(document.styleSheets.length > 0){
    for(var i = 0; i < document.styleSheets.length; ++i){
     if(document.styleSheets[i].disabled) continue;
     var media = document.styleSheets[i].media;
     mediaType = typeof media;
     if(mediaType === "string" && (media === "" || (media.indexOf("screen") !== -1))) styleSheet = document.styleSheets[i]; else
     if(mediaType === "object" && (media.mediaText === "" || (media.mediaText.indexOf("screen") !== -1))) styleSheet = document.styleSheets[i];
     if(styleSheet !== undefined) break;
    }
   }
   if(styleSheet === undefined){
    $(helem).add((new $('style')).attr('type', 'text/css'));
    for(var i = 0; i < document.styleSheets.length; ++i){
     if(document.styleSheets[i].disabled) continue;
     styleSheet = document.styleSheets[i];
    }
    mediaType = typeof styleSheet.media;
   }
   if(mediaType === "string"){
    for(var i = 0; i < styleSheet.rules.length; ++i){
     if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() === selector.toLowerCase()){
      styleSheet.rules[i].style.cssText = style;
      return this;
     }
    }
    styleSheet.addRule(selector, style);
   }else if(mediaType === "object"){  
    for(var i = 0; i < styleSheet.cssRules.length; ++i){
     if(styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() === selector.toLowerCase()){
      styleSheet.cssRules[i].style.cssText = style;
      return this;
     }
    }
    styleSheet.insertRule(selector + "{" + style + "}", i);
   }
   return this;
  }
  $.conflict = function(){
   window.$ = _$;
   return $;
  }

  return $;
 })();

 var displayCache = {}, readyList=[], Event = (function(){
  var guid = 0
  function fixEvent(event){
   event = event || window.event
   if(event.isFixed) return event;
   event.isFixed = true;
   event.preventDefault = event.preventDefault || function(){this.returnValue = false}
   event.stopPropagation = event.stopPropagation || function(){this.cancelBubble = true}
   if(!event.target) event.target = event.srcElement;
   if(!event.relatedTarget && event.fromElement) event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
   if(event.pageX == null && event.clientX != null){
    var html = document.documentElement, body = document.body;
    event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
    event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
   }
   if(!event.which && event.button) event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0 )));
   return event
  }
  function getChar(event){
   if(event.which == null){  // IE
    if(event.keyCode < 32) return null; // спец. символ
    return String.fromCharCode(event.keyCode) 
   }
   if(event.which != 0 && event.charCode != 0){ // все кроме IE
    if(event.which < 32) return null; // спец. символ
    return String.fromCharCode(event.which); // остальные
   }
   return null; // спец. символ
  }
  function commonHandle(event){ // Вызывается в контексте элемента всегда this = element
   event = fixEvent(event);
   event.symbol = getChar(event);
   var handlers = this.events[event.type];
   for(var g in handlers){
    var handler = handlers[g]
    var ret = handler.call($(this), event);
    if(ret === false){
     event.preventDefault();
     event.stopPropagation();
     event.cancelBubble = true;
    }else if(ret !== undefined){
     event.result = ret;
    }
    if(event.stopNow) break;
   }
  }
  return {
   append:function(elem, type, handler){
    if(elem.setInterval && (elem != window && !elem.frameElement)) elem = window;
    if(!handler.guid) handler.guid = ++guid;
    if(!elem.events){
     elem.events = {};
     elem.handle = function(event){
      if(typeof Event !== undefined) return commonHandle.call(elem, event);
     }
    }
    if(!elem.events[type]){
     elem.events[type] ={};
     if(elem.addEventListener) elem.addEventListener(type, elem.handle, false); else if(elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
    }
    elem.events[type][handler.guid] = handler;
   },
   remove:function(elem, type, handler){
    var handlers = elem.events && elem.events[type];
    if(!handlers) return;
    if(!handler){
     if(!type){
      for(type in elem.events) for(var handle in handlers) delete elem.events[type][handle];
     }else{
      for(var handle in handlers) delete elem.events[type][handle];
     }
     return;
    }
    delete handlers[handler.guid];
    for(var any in handlers) return;
    if(elem.removeEventListener) elem.removeEventListener(type, elem.handle, false); else if(elem.detachEvent) elem.detachEvent("on" + type, elem.handle);
    delete elem.events[type];
    for(var any in elem.events) return;
    try{
     delete elem.handle;
     delete elem.events ;
    }catch(e){ // IE
     elem.removeAttribute("handle");
     elem.removeAttribute("events");
    }
   }
  }
 }());
 function bindReady(handler){
  var called = false;
  function ready(){
   if(called) return;
   called = true;
   handler();
  }
  function tryScroll(){
   if(called) return;
   try{
    helem.doScroll("left");
    ready();
   }catch(e){ setTimeout(tryScroll, 0); }
  }
  function onListenerReady(){
   document.removeEventListener("DOMContentLoaded", onListenerReady, false);
   ready();
  }
  function onAttachReady(){
   if(document.readyState === "complete"){
    document.detachEvent("onreadystatechange", onAttachReady);
    ready();
   }
  }
  if(document.addEventListener){
   document.addEventListener("DOMContentLoaded", onListenerReady, false);
  }else if(document.attachEvent){
   if(helem.doScroll && window == window.top){
    tryScroll();
   }
   document.attachEvent("onreadystatechange", onAttachReady)
  }
  if(window.addEventListener) window.addEventListener('load', ready ,false); else if(window.attachEvent) window.attachEvent('onload', ready); // else window.onload = ready
 }
 function create(elem, params){
  elem = elem.nodeType ? elem : document.createElement(elem);
  if(params)
   for(var i in params) switch(i){
    case "html": elem.innerHTML = params[i]; break;
    case "css": elem.setAttribute('style', params[i]); break;
    case "cls": elem.className = params[i];
    default: elem.setAttribute(i, params[i]);
   }
  return elem;
 }
 function isHidden(el){
  var width = el.offsetWidth, height = el.offsetHeight, tr = el.nodeName.toLowerCase() === "tr";
  return width === 0 && height === 0 && !tr ? true : width > 0 && height > 0 && !tr ? false : getRealDisplay(el)
 }
 function getRealDisplay(elem){
  if(elem.currentStyle){
   return elem.currentStyle.display
  }else if(window.getComputedStyle){
   var computedStyle = window.getComputedStyle(elem, null);
   return computedStyle.getPropertyValue('display');
  }
 }
 function hide(el){
  if(!el.getAttribute('displayOld')) el.setAttribute("displayOld", el.style.display);
  el.style.display = "none";
 }
 function show(el){
  if(getRealDisplay(el) != 'none') return;
  var old = el.getAttribute("displayOld");
  el.style.display = old || "";
  if(getRealDisplay(el) === "none"){
   var nodeName = el.nodeName, body = document.body, display;
   if(displayCache[nodeName]){
    display = displayCache[nodeName];
   }else{
    var testElem = create(nodeName);
    body.appendChild(testElem);
    display = getRealDisplay(testElem);
    if(display === "none") display = "block";
    body.removeChild(testElem);
    displayCache[nodeName] = display;
   }
   el.setAttribute('displayOld', display);
   el.style.display = display;
  }
 }
 function getIEComputedStyle(elem, prop){
  var value = elem.currentStyle[prop] || 0, leftCopy = elem.style.left, runtimeLeftCopy = elem.runtimeStyle.left;
  elem.runtimeStyle.left = elem.currentStyle.left;
  elem.style.left = (prop === "fontSize") ? "1em" : value;
  value = elem.style.pixelLeft + "px";
  elem.style.left = leftCopy;
  elem.runtimeStyle.left = runtimeLeftCopy; 
  return value;
 }

 window.$ = window.$ = $;
})(window, document, document.documentElement||document.body, window.navigator, window.location);
