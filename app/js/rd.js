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
    var uri = 'http://' + this.options.server + '/1.txt?t=' + t + '&m=' + m;
    if (rd.options.use_img_for_send) {
      var img = document.getElementById('remote_debugger_img');
      img.src = uri;
    } else {
      try {
        var xmlhttp = this.getXmlHttp()
        xmlhttp.open('GET', uri, false);
        xmlhttp.send(null);
      } catch(e) {

      }
    }
  };

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

rd.info('Соединение c JS установлено');
