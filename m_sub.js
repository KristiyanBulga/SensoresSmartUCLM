require('dotenv').config();
// cargamos los paquetes necesarios
var mqtt = require('mqtt');
const _ = require('lodash');
const Influx = require('influx');

// creamos el cliente mqtt
var clienteMqtt = mqtt.connect('mqtt:/localhost:1883');
var topico = "sensoresMqtt";

const cliente = new Influx.InfluxDB({
  database: 'sensoresDB',
  host: process.env.HOST,
  port: 8086,
 // username: process.env.UNAME,
  //password: process.env.PASSWORD,
});

// cuando llega un mensaje lo procesamoes
clienteMqtt.on('message', (topico, mensaje) =>{
    mensaje = mensaje.toString();
    console.log(mensaje);
    mensaje = JSON.parse(mensaje)
    // AQUI guardamos la información en la base de datos
});

// al conectarse el cliente se subscribe al tópico para poder recibir los datos
clienteMqtt.on('connect', ()=>{
    clienteMqtt.subscribe(topico);
});

