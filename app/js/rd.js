Remote_debugger = function () {
  this.options = {
    'use_img_for_send':false,
    'server':'%server_ip:%server_port'
  };

  this.getXmlHttp = function (){
    var xmlhttp;

    try {
      xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (E) {
        xmlhttp = false;
      }
    }

    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
      xmlhttp = new XMLHttpRequest();
    }

    return xmlhttp;
  };

  this.send = function(m,t) {
    var uri = 'http://' + this.options.server + '/1.txt';
    if (rd.options.use_img_for_send) {
      var img = document.getElementById('remote_debugger_img');
      img.src = uri + '?t=' + t + '&m=' + m;
    } else {
      try {
        var xmlhttp = this.getXmlHttp()
        xmlhttp.open('POST', uri + '?t=' + t, false);        
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xmlhttp.send(m);
      } catch(e) {

      }
    }
  };

  this.init_comet = function() {
    var uri = 'http://' + this.options.server + '/comet.json';
    
    var xmlhttp = this.getXmlHttp()
    xmlhttp.open('POST', uri, true);        
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState != 4) return;
      if (xmlhttp.status == 200) {
        try {
          rd.answer(eval(xmlhttp.responseText));
        } catch(e) {
          rd.error(e);
        }
      }
      setTimeout(function(){rd.init_comet();},100);
    }
    xmlhttp.send(null);
  }

  this.answer = function(t){
    this.send(t,'return');
  }

  this.log = function(t){
    this.send(t,'log');
  }

  this.info = function(t){
    this.send(t,'info');
  }

  this.error = function(t){
    this.send(t,'error');
  }

  this.warn = function(t){
    this.send(t,'warn');
  }
  return this;
};

var rd = new Remote_debugger();
if (rd.options.use_img_for_send) {
  document.writeln('<img id="remote_debugger_img" style="display:none;">');
}
rd.init_comet();
rd.info('Соединение c JS установлено');
