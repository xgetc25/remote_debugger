top.params = {
	'server' : {
		'ip' : '127.0.0.1',
		'port' : 7760
	}
};

$.extend(top.params,top.config);

$(document).ready(function() {
	init_server();

	$('.current_request input').keypress(function(k) {
	  if (k.charCode == 13) {
	  	send_msg($('.current_request input').val());
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

function print_request(text) {
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

		} else {

			req.on('data', function(chunk) {
				var get_params = url_parts.query;
				print_answer(chunk.toString(), get_params.t);	
			});

			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('');
		}

	}).listen(params.server.port, '0.0.0.0');
}