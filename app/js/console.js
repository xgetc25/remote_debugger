top.params = {
	'server' : {
		'port' : 7760
	}
};

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

	$('.console').html('<strong>НАЧАЛО</strong>'
		+ '<p>Для запуска скрипта добавьте на своей странице в BODY:<pre><code>&lt;script src="http://127.0.0.1:' + params.server.port + '/rd.js" type="text/javascript"&gt;&lt;/script&gt;</code></pre></p>'
		+ '<p>Что бы отправить сообщение в консоль выполните в своем коде одну из функций:<pre><code>rd.log(\'MESSAGE\');\nrd.info(\'MESSAGE\');\nrd.error(\'MESSAGE\');\nrd.warn(\'MESSAGE\');</code></pre></p>'
		+ '<p><strong>TODO</strong></p><ul><li>Отправка сообщений из консоли.</li></ul>'
	);
	
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
	
	$("html,body").animate({"scrollTop":$("html,body").height()},100);
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
				res.end(data);
			});

		} else {

			var get_params = url_parts.query;

			if (get_params.t && get_params.m) {
				print_answer(get_params.m, get_params.t);	
			}

			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('');
		}

	}).listen(params.server.port, '0.0.0.0');
}