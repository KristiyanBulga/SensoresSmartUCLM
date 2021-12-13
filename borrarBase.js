require('dotenv').config();

// cargamos los paquetes necesarios
const Influx = require('influx');
const _ = require('lodash');

// creamos el cliente Influx
const cliente = new Influx.InfluxDB({
  database: 'sensoresDB',
  host: process.env.HOST,
  port: 8086,
 // username: process.env.UNAME,
  //password: process.env.PASSWORD,
});


// SE HAN COMENTADO LAS LINEAS PARA EVITAR BORRAR LA BASE DE DATOS SIN QUERER

//cliente.query("drop measurement usuarios")
//cliente.query("drop measurement motas")
//cliente.query("drop measurement sensores")
//cliente.query("drop measurement mediciones")