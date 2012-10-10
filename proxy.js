var util = require('util');
var colors = require('colors');
var httpProxy = require('http-proxy');
var http = require('http');
var spawn = require('child_process').spawn;


//proxy for apps
httpProxy.createServer({
  hostnameOnly:false,
  router:{
    'microstrategy.36node.com': 'localhost:3000',
    '211.157.105.122': 'localhost:8080'
  }
}).listen(80, '0.0.0.0');

util.puts('http proxy server '.blue + 'started '.green.bold + 'on port '.blue + '80 '.yellow + 'with proxy table'.magenta.underline);
