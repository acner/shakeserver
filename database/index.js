const { Client } = require('pg');
const Config = require('./config.json');

function log(log,ip,tiempo){
	 var date = new Date();
	    if (log && typeof log == "object") {
	        if (tiempo) {
	            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + ' - ' +tiempo + " sec => ", log);
	        } else {
	            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " => ", log);
	        }
	    } else {
	        if (tiempo) {
	            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + ' / ' + tiempo + " sec => " + log);
	        } else {
	            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " => " + log);
	        }
	    }
}

module.exports = {
	ip:'',
  	query: (text, callback,error) => {
  		var self = this;
  		var client = new Client({
		  host: Config.host,
		  port: Config.port,
		  user: Config.user,
		  password: Config.password,
		  database: Config.database,
		});
  		client.connect()
	  		.catch(e => log('connection error:'+e.stack,self.ip));

  		const start = Date.now()
		client.query(text)
		.then((res)=>{
			const duration = Date.now() - start
			log(text,self.ip,duration)
			client.end();
	      	return  callback(res);
		}).
		catch((error) =>{
			client.end();
	      	log(error,self.ip)
	      	return  error(error);
		})
  	},
  	setIp : (ip)=>{
  		this.ip = ip;
  	},
  	log:(text, ip,tiempo)=>{
  		log(text,ip,tiempo);
	   
	}
}