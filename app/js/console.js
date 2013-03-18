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

	$('.current_request input').keyup(function(k) {
		switch (k.keyCode) {
			case 13:
				send_msg($('.current_request input').val());
				break
			case 38:
				history(true);
				break
			case 40:
				history(false);
				break
			default:
				top.console_history.last = $('.current_request input').val();
		}
	});

	$('.panel a[href=\'#clear\']').click(function(){
		$('.console').html('');
	});

	$('.panel a[href=\'#about\']').click(function(){
		var gui = require('nw.gui');
		gui.Shell.openExternal('https://github.com/bespechnost/remote_debugger');
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
	top.console_history.history.push(text);
	top.console_history.last = '';
	top.console_history.current = 0;

	var request = document.createElement('div');
	request.innerText = ' ' + text;
	request.className = 'request';

	$('.console').get(0).appendChild(request);
	
	scroll_bottom();
}

function scroll_bottom() {
	$(".wrapper_console").animate({"scrollTop":$(".console").height()},100);
}

function print_answer(text,type) {
	if (!type) {
		var type = 'info';
	}
	var answer = document.createElement('div');
	answer.innerText = ' ' + text;
	answer.className = 'answer ' + type;

	$('.console').get(0).appendChild(answer);
	
	scroll_bottom();
}

function send_msg(code) {
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
				var answer = data.replace(/%server_ip/g,top.params.server.ip).replace(/%server_port/g,top.params.server.port)
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