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

top.params = {
	'server' : {
		'ip' : '127.0.0.1',
		'port' : 7760
	}
};

top.console_history = {
	'last': '',
	'current' : 0,
	'history' : []
};

$.extend(top.params,top.config);

$(document).ready(function() {
	init_server();

	$('.current_request input').keydown(function(k) {
		switch (k.keyCode) {
			case 38:
				history(true);
				break
			case 40:
				history(false);
				break
		}
	});

	$('.current_request input').keyup(function(k) {
		switch (k.keyCode) {
			case 13:
				send_msg($('.current_request input').val());
				break
			default:
				top.console_history.last = $('.current_request input').val();
		}
	});

	$('.panel a[href=\'#clear\']').click(function(){
		$('.console').html('');
	});

    $('.panel a[href=\'#refresh\']').click(function(){
        send_msg('refresh');
    });

	$('.panel a[href=\'#about\']').click(function(){
		var gui = require('nw.gui');
		gui.Shell.openExternal('https://github.com/bespechnost/remote_debugger');
	});

	$('.wrapper_console').click(function(){
		$('.current_request input').focus();
	});
		
	scroll_bottom();

});

function history(up) {
	var history = [''];
	
	for (var i in top.console_history.history) {
		history.push(top.console_history.history[i]);
	}
	
	if (top.console_history.last !== '') {
		history.push(top.console_history.last);
	}

	if (up) {
		if (top.console_history.current == history.length) {
			return;
		}
		top.console_history.current = top.console_history.current + 1;
	} else {
		if (top.console_history.current == 1) {
			return;
		}
		top.console_history.current = top.console_history.current - 1;
	}

	$('.current_request input').val( history[history.length - top.console_history.current] );
}

function print_request(text) {
	if (top.console_history.history.length == 0 || top.console_history.history[top.console_history.history.length - 1] !== text) {
		top.console_history.history.push(text);
	}

	top.console_history.last = '';
	top.console_history.current = 0;

	var request = document.createElement('div');
	request.innerText = ' ' + text;
	request.className = 'request';

	$('.console').get(0).appendChild(request);
	
	scroll_bottom();
}

function scroll_bottom() {
	$(".wrapper_console").animate({"scrollTop":$(".console").height()},0);
}

function htmlspecialchars(html) {
    // Сначала необходимо заменить &
    html = html.replace(/&/g, "&amp;");
    // А затем всё остальное в любой последовательности
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    html = html.replace(/"/g, "&quot;");
    // Возвращаем полученное значение
    return html;
}

function print_answer( text, type )
{
	if (!type)
    {
		var type = 'info';
	}
	var answer = document.createElement('div');

    var _text = text;
    try
    {
        text = text.replace(/\n/g, '');
        text = eval('('+ text +')');
        text = '<span style="color: #ccc;">[' + text.time + ']</span>&nbsp;' + htmlspecialchars( Base64.decode(text.text) );
    }
    catch(e)
    {
        text = e.name + ', ' + e.message + ', ' + e.stack + ', ';
        text += _text;
    }

	answer.innerHTML = text;
	answer.className = 'answer ' + type;

	$('.console').get(0).appendChild(answer);
	
	scroll_bottom();
}

function send_msg(code)
{
    switch( code )
    {
        case 'f5':
        case 'refresh':
            code = 'document.location.reload(true)';
            break;

        case 'clean':
        case 'clear':
            $('.current_request input').val('');
            $('.console').html('');
            return;
            break;
    }

	print_request(code);
	
	$('.current_request input').val('');
	
	if (top.res_comet) {
		top.res_comet.writeHead(200, {'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*'});
		top.res_comet.end(code);
	}
}

function init_server() {
	var http = require('http');
	
	http.createServer(function (req, res) {
		var url_parts = require('url').parse(req.url, true);

		if (url_parts.pathname == '/rd.js') {

			var fs = require('fs');
			fs.readFile('./js/rd.js', 'utf8', function (err,data) {
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				var answer = data.replace(/%server_ip/g,top.params.server.ip);
				answer = answer.replace(/%server_port/g,top.params.server.port);
				answer = answer.replace(/%use_img_for_send/g,top.params.server.use_img_for_send);
				answer = answer.replace(/%use_rnd_in_img_for_send/g,top.params.server.use_rnd_in_img_for_send);
				answer = answer.replace(/%use_comet/g,top.params.server.use_comet);
				answer = answer.replace(/%xmlhttp_object/g,top.params.server.xmlhttp_object);
				
				res.end(answer);
			});

		} else if (url_parts.pathname == '/comet.json') {
			top.res_comet=res;
			req.on("close", function() {
					if (!top.res_comet) return;
			  		res.writeHead(200, {'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*'});
					res.end('');
					top.res_comet = false;
			});

		} else if (url_parts.pathname == '/img.gif') {
			var get_params = url_parts.query;

			if (get_params.t && get_params.m) {
				print_answer(get_params.m, get_params.t);  
			}

			res.writeHead(200, {'Content-Type': 'application/json',  'Access-Control-Allow-Origin': '*'});
			res.end('');
		} else {

			req.on('data', function(chunk) {
				var get_params = url_parts.query;
				print_answer(chunk.toString(), get_params.t);	
			});

			res.writeHead(200, {'Content-Type': 'text/plain',  'Access-Control-Allow-Origin': '*'});
			res.end('');
		}

	}).listen(params.server.port, '0.0.0.0');
}