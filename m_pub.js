// cargamos los paquetes necesarios
var mqtt = require('mqtt');
// creamos el cliente mqtt
var cliente = mqtt.connect('mqtt:/localhost:1883');
var topico = "sensoresMqtt";

// al conectarnos al broker enviamos información a un tópico
cliente.on('connect', ()=>{
    // cada cierto tiempo envia información. Esto lo determinará el usuario
    setInterval(() => {
        var mensaje = {
            idsensor: '',
            medicion: 0,
            timestamp: 1627553172000, // en milisegundos
        };
        cliente.publish(topico, JSON.stringify(mensaje))
        console.log("Mensaje enviado: ", mensaje)
    }, 3000);
});