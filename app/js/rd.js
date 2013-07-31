/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

Remote_debugger = function ()
{
    this.options = {
        'use_img_for_send':         %use_img_for_send,
        'use_rnd_in_img_for_send':  %use_rnd_in_img_for_send,
        'comet':                    %use_comet,
        'server':                   '%server_ip:%server_port'
    };

    this.getXmlHttp = function ()
    {
        return %xmlhttp_object;
    };

    /**
     *
     * @param t {{String}}
     * @param m {{Array}}
     */
    this.send = function (t, m)
    {
        m = Array.prototype.slice.call( m );
        for (var i = 0; i < m.length; i++)
        {
            if (typeof( m[i] ) != 'string')
            {
                m[i] = JSON.stringify(m[i]);
            }
        }
        var _t = new Date();
        m = '{ "time": "'+ (_t.getHours()+':'+_t.getMinutes()+':'+_t.getSeconds()+':'+_t.getMilliseconds() ).toString() +'", "text": "'+ Base64.encode(m.join(', ')) +'" }';
        m = m.replace( /\n/g, '' );
        m = m.replace( ' ', '' );

        var uri = 'http://' + this.options.server;
        if (rd.options.use_img_for_send)
        {
            var img = document.getElementById('remote_debugger_img');
            if (rd.options.use_rnd_in_img_for_send == true)
            {
                var rnd = '&r=' + Math.random();
            }
            else
            {
                var rnd = '';
            }
            img.src = uri + '/img.gif?t=' + t + '&m=' + m + rnd;
        }
        else
        {
            try
            {
                var xmlhttp = this.getXmlHttp();
                xmlhttp.open('POST', uri + '/1.txt?t=' + t, false);
                xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xmlhttp.send(m);
            }
            catch(e) {}
        }
    };

    this.init_comet = function ()
    {
        var uri = 'http://' + this.options.server + '/comet.json';

        var xmlhttp = this.getXmlHttp();
        xmlhttp.open('POST', uri, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        xmlhttp.onreadystatechange = function ()
        {
            if (xmlhttp.readyState != 4) return;
            if (xmlhttp.status == 200)
            {
                try
                {
                    rd.answer(eval(xmlhttp.responseText));
                }
                catch (e)
                {
                    rd.error(e);
                }
            }
            setTimeout(function()
            {
                rd.init_comet();
            }, 100);
        }
        xmlhttp.send(null);
    }

    this.answer = function (t)
    {
        this.send('return', arguments);
    }

    this.log = function (t)
    {
        this.send('log', arguments);
    }

    this.info = function (t)
    {
        this.send('info', arguments);
    }

    this.error = function (t)
    {
        this.send('error', arguments);
    }

    this.warn = function (t)
    {
        this.send('warn', arguments);
    }
    return this;
};

var rd = new Remote_debugger();
if (rd.options.use_img_for_send)
{
    document.writeln('<img id="remote_debugger_img" style="display:none;">');
}

if (rd.options.comet)
{
    rd.init_comet();
}

rd.info('Соединение c JS установлено. v.1');
