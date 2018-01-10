
var express = require('express');
const { Client } = require('pg');
const db = require('./database');
const logger = require('./database');

var app = express();
app.use(function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	db.setIp(ip);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/lugares/peligrosos/:tipo', (req, res, next) => {
	var tipo = req.params.tipo;
	var str = "";
	
	if(tipo=='all'){
		str = "SELECT * FROM peligro_lugares ";
	}else if(tipo>0){
		str = "SELECT * FROM peligro_lugares where tipo_peligro = "+tipo; 
	}else{
		res.status(403).send({error:"el tipo no corresponde"});
	}
	
  	db.query(str,
  		(data) => {
	    	res.send({num_rows: data.rowCount,result:data.rows});
  		},
  		(err)=>{
  			res.status(500).send({error:err});
  		})
})

app.get('/', function(req, res) {
   
    logger.log('API creado por Acner Pinazo acner@elyon.com.py');
    res.send('API creado por Acner Pinazo acner@elyon.com.py');
});


app.get('/lugares/peligrosos/:tipo/:latitud/:longitud',(req, res, next) => {	
	var latitud = req.params.latitud;
	var longitud = req.params.longitud;
	var tipo = req.params.tipo;
	var str = "";
	
	if(tipo=='all'){
		str = "SELECT * FROM peligro_lugares\
			WHERE ST_Distance_Sphere(coordenada, ST_MakePoint("+longitud+","+latitud+")) <= 1 * 1609.34";
	}else if(tipo>0){
		str = "SELECT * FROM peligro_lugares \
			WHERE tipo_peligro = "+tipo+" and ST_Distance_Sphere(coordenada, ST_MakePoint("+longitud+","+latitud+")) <= 1 * 1609.34"; 
	}else{
		res.status(403).send({error:"el tipo no corresponde"});
	}
	
  	db.query(str,
  		(data) => {
	    	res.send({num_rows: data.rowCount,result:data.rows});
  		},
  		(err)=>{
  			res.status(500).send({error:err});
  		})

})

app.listen(8080, function() {
    logger.log('Inicio el servidor node en el puerto 8080', '127.0.0.1:8080');
    // console.log('Inicio el servidor node en el puerto 80');
})









/*



client.connect()
client.query('SELECT $1::text as name', ['brianc'], (err, res) => {
  if (err) throw err
  console.log(res)
  client.end()
})




var doClose = function(connection, resultSet, response) {
    resultSet.close(
        function(err) {
            if (err) {
                log(err.message);
                response.json({ error: err.message });
            }
            connection.close(function(err) {
                if (err) {
                    log(err.message);
                    response.json({ error: err.message });
                }
            });
        });
}

var getFactura = function(nro_factura, connection, response, ip) {
    connection.execute(
        "SELECT * FROM TRC.FACTURAS_CLIENTES where nro_factura = '" + nro_factura + "'", [], { resultSet: true }, // return a ResultSet.  Default is false
        function(err, result) {
            if (err) {
                log(err.message, ip, nro_factura);
                doRelease(connection);
                response.json({ error: err.message });
                return;
            }
            // console.log(result);
            handlerResponse(connection, result.resultSet, response, ip, nro_factura);
        });
};

var handlerResponse = function(connection, resultSet, response, ip, nro_factura) {
    var rowCount = 0;
    resultSet.getRow( // get one row
        function(err, row) {
            if (err) {
                log(err.message, ip, nro_factura);
                doClose(connection, resultSet, response);
                response.json({ error: err.message });
            } else if (!row) {
                log("No existe datos", ip, nro_factura);
                doClose(connection, resultSet, response);
                response.status(404).json({ response: "No existe datos", nro_factura: nro_factura });
            } else {
                rowCount++;
                //console.log("handlerResponse(): row " + rowCount);
                log(row, ip, nro_factura);
                response.status(200).json({ response: row });
                //handlerResponse(connection, resultSet,response);
            }
        });
}

function log(log, ip, factura) {
    var date = new Date();
    if (log && typeof log == "object") {
        if (factura) {
            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + ' - ' + factura + " => ", log);
        } else {
            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " => ", log);
        }
    } else {
        if (factura) {
            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + ' / ' + factura + " => " + log);
        } else {
            console.log(ip + ' - ' + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " => " + log);
        }
    }

}
app.get('/', function(req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log('API creado por Acner Pinazo acner@elyon.com.py', ip);
    res.send('API creado por Acner Pinazo acner@elyon.com.py');
});

app.get('/consulta/:nro_factura', function(req, response) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var nro_factura = req.params.nro_factura;
    if (/[0-9]{3}-[0-9]{3}-[0-9]{7}$/.test(nro_factura)) {
        oracledb.getConnection({
                user: dbConfig.user,
                password: dbConfig.password,
                connectString: dbConfig.connectString
            },
            function(err, connection) {
                if (err) {
                    log(err.message, ip, nro_factura);
                    response.json({ error: err.message });
                    return;
                }
                getFactura(nro_factura, connection, response, ip);
            });
    } else {
        log("El parametro debe ser numerico xxx-xxx-xxxxxxx", ip, nro_factura);
        response.json({
            error: "El parametro debe ser numerico xxx-xxx-xxxxxxx"
        });
    }

});

app.listen(80, function() {
    log('Inicio el servidor node en el puerto 80', '127.0.0.1:80');
    // console.log('Inicio el servidor node en el puerto 80');
})*/