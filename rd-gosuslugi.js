 <script type="text/javascript">
       function sendMessage(m) {
           var parentNode = document.getElementsByTagName("head")[0];
                var obj = document.createElement("img");
                obj.id = 'remote_debugger_img';
                obj.src = 'http://172.16.11.160:7760/rdebugger?t=log&m=' + m;
                parentNode.appendChild(obj);
       };
        try {


        if (typeof JSON === 'undefined') {

           sendMessage('no json');

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
                'server': '172.16.11.160:7760'
            };
            
            this.getXmlHttp = function() {
               return new XMLHttpRequest();
            };

            this.send = function(outputText, t) {
                try {
                var xmlhttp = this.getXmlHttp();
                xmlhttp.open('POST', 'http://172.16.11.160:7760/1.txt?t=' + t, false);
                xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xmlhttp.send(outputText);
                } catch (e) {
                   sendMessage(e);
                }
            };

            this.initComet = function() {
                var xmlhttp = this.getXmlHttp();
                xmlhttp.open('POST', 'http://172.16.11.160:7760/comet.json', true);
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
                var output = '';
                for (var i = 0, l = args.length; i < l; i++) {
                    output += this.serialize(args[i]) + ', ';
                }
                this.send(output, 'log');
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







         } catch (e) {
           sendMessage(e);
         }
                
         window.onerror = function(a,b,c) {
           rd.log(a,b,c);
         };

        </script>
