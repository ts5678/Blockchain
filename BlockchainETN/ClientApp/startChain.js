function exec(cmd,args, handler = function(error, stdout, stderr){console.log(stdout);if(error !== null){console.log(stderr)}})
{
    
   
    
    const exec = require('child_process').exec;
    var ls =  exec(cmd,args);

    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
      });
      
      ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
      });
      
      ls.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
      });


}

var date = new Date(Date.now());
date = date.toISOString();
console.log(date);

var cmd  =  "ganache-cli -t " + date;

exec(cmd,["-t",date], function(err, stdout){console.log(stdout+stdout+stdout); console.log(err)});