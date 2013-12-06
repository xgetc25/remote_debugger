if (typeof JSON === 'undefined') {
    JSON = {
        stringify: function(object) {
            var result = '';

            if (Object.prototype.toString.call( object ) === '[object Array]') {
                // array
                result += '[';
                for (var i=0,l = object.length; i<l; i++){

                    if ( (Object.prototype.toString.call( object ) === '[object Array]') || (Object.prototype.toString.call( object ) === '[object Object]')  ) {
                        result += JSON.stringify(object[i]);
                    } else {
                        result += object[i];    
                    }
                    result += ',';
                }
                result += ']';
            }
            if (Object.prototype.toString.call( object ) === '[object Object]') {
                // object
                result += '{';
                for (var prop in object){
                    result += prop + ' : ' + JSON.stringify(object[prop]);
                }
                result += '}';
            }
            if (!result) {
                result += object;
            }
            return result;
        }
    }
}

Remote_debugger = function() {

    this.options = {
        'use_img_for_send': %use_img_for_send,
        'use_rnd_in_img_for_send': %use_rnd_in_img_for_send,
        'comet': %use_comet,
        'server': '%server_ip:%server_port'
    };

    this.getXmlHttp = function() {
        return %xmlhttp_object;
    };

    
    this.send = function(m, t) {
        var outputText;
        try {


        var xmlhttp = this.getXmlHttp()
        xmlhttp.open('POST', '/1.txt?t=' + t, false);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        outputText = this.serialize(m);
        xmlhttp.send(outputText);
        } catch (e) {
            var parentNode = document.getElementsByTagName("body")[0];
            var obj = document.createElement("img");
            obj.id = 'remote_debugger_img';
            obj.src = 'http://172.16.11.160:7760/rdebugger?t=log&m=e' + e;
            parentNode.appendChild(obj);
        }
    };

    this.initComet = function() {
        var xmlhttp = this.getXmlHttp()
        xmlhttp.open('POST', '/comet.json', true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState != 4) {
                return;
            };
            if (xmlhttp.status == 200) {
                try {
                    rd.answer(eval(xmlhttp.responseText));
                } catch (e) {
                    rd.error(e)
                }
            }
            setTimeout(function() {
                rd.initComet();
            }, 500);
        }
        xmlhttp.send(null);
    }

    this.answer = function(t) {
        this.send(t, 'return');
    }

    this.log = function(t) {
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0, l = args.length; i < l; i++) {
            this.send(args[i], 'log');
        }
    }

    this.info = function(t) {
        this.send(t, 'info');
    }

    this.error = function(t) {
        this.send(t, 'error');
    }

    this.warn = function(t) {
        this.send(t, 'warn');
    }

    this.serialize = function(object) {
        return JSON.stringify(object)
    };

    this.log('Connected from ' + location.href);

    this.initComet();
    
 
    return this;
};
var rd = new Remote_debugger();





