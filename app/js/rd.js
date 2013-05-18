Remote_debugger = function () {
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
        var lineNum = m.length > 1;
        if (typeof( m[i] ) != 'string')
        {
            m[i] = JSON.stringify(m[i]);
        }
        if (lineNum)
        {
            m[i] = i + '. ' + m[i];
        }

    }
    m = m.join('<br>');

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
