require('dotenv').config();

// cargamos los paquetes necesarios
const Influx = require('influx');
const _ = require('lodash');
const bcryptjs = require("bcryptjs");

// creamos el cliente Influx
const cliente = new Influx.InfluxDB({
  database: 'sensoresDB',
  host: process.env.HOST,
  port: 8086,
 // username: process.env.UNAME,
  //password: process.env.PASSWORD,
});

// cargamos tres usuarios a la base de datos
loadUsuario = async() => {
    try {
      const filas = [{
        measurement: 'usuarios',
        tags: {
          id: 'u_x4ymym6yq',
          nombre: 'Primer',
          apellido1: 'Primero',
          apellido2: 'First',
          correo: 'primero@ejemplo.com',
          password: bcryptjs.hashSync('primero'),
        },
        fields: { entrado: 0, },
        timestamp: 1627294813000,
      },{
        measurement: 'usuarios',
        tags: {
          id: 'u_56nr1fqgg',
          nombre: 'Segund',
          apellido1: 'Segundo',
          apellido2: 'Second',
          correo: 'segundo@ejemplo.com',
          password: bcryptjs.hashSync('segundo'),
        },
        fields: { entrado: 0, },
        timestamp: 1627294814000,
      },];
      await cliente.writePoints(filas);
      console.log('Se ha guardado correctamente!');
    } catch (err) {
      console.log(`Se ha producido un error ${err}`);
    }
};

// Cargamos motas relacionandolas con los usuarios
loadMota = async() => {
    try {
      const filas = [{
        measurement: 'motas',
        tags: {
          id: 'm_raleutmtg',
          idusuario: 'u_56nr1fqgg',
          nombre: 'mota sin mediciones',
          direccion: 'direccion mota 0',
          x: 38.97879369397434,
          y: -1.8575138181271338,
          z: 5,
        },
        fields: { entrado: 0, },
        timestamp: 1627294815000,
      },{
        measurement: 'motas',
        tags: {
          id: 'm_r9cpe66q5',
          idusuario: 'u_x4ymym6yq',
          nombre: 'Termometro',
          direccion: 'Edificio Polivalente, C. Cronista Francisco Ballesteros Gómez, 1, 02005 Albacete',
          x: 38.97928730141732,
          y: -1.8554401314141893,
          z: 5,
        },
        fields: { entrado: 0, },
        timestamp: 1627294816000,
      },{
        measurement: 'motas',
        tags: {
          id: 'm_qlz6v23xv',
          idusuario: 'u_x4ymym6yq',
          nombre: 'mota sin sensores',
          direccion: 'direccion mota 2',
          x: 38.977837710205485,
          y: -1.8569651506300124,
          z: 5,
        },
        fields: { entrado: 0, },
        timestamp: 1627294817000,
      },];
      await cliente.writePoints(filas);
      console.log('Se ha guardado correctamente!');
    } catch (err) {
      console.log(`Se ha producido un error ${err}`);
    }
};

// creamos sensores relacionandolos con las motas
loadSensor = async() => {
    try {
      const filas = [{
        measurement: 'sensores',
        tags: {
          id: 's_w3wm7i1c2',
          idmota: 'm_r9cpe66q5',
          nombre: 'Temperatura superficial',
          tipo: 'temperatura',
          unidad: 'ºC',
        },
        fields: { mostrar: 1, },
        timestamp: 1627294817000,
      },{
        measurement: 'sensores',
        tags: {
          id: 's_gr4ru7osi',
          idmota: 'm_r9cpe66q5',
          nombre: 'Temperatura interior',
          tipo: 'temperatura',
          unidad: 'ºC',
        },
        fields: { mostrar: 1, },
        timestamp: 1627294818000,
      },{
        measurement: 'sensores',
        tags: {
          id: 's_uhxi9i00g',
          idmota: 'm_raleutmtg',
          nombre: 'Humedad estancia',
          tipo: 'humedad',
          unidad: 'g/m3',
        },
        fields: { mostrar: 1, },
        timestamp: 1627294819000,
      },];
      await cliente.writePoints(filas);
      console.log('Se ha guardado correctamente!');
    } catch (err) {
      console.log(`Se ha producido un error ${err}`);
    }
};

const idsensores = ['s_w3wm7i1c2', 's_gr4ru7osi']
const tipos = ['temperatura', 'humedad', 'luminosidad']

// función que se llamará cada dos segundos para simular las mediciones de los sensores
loadMedicion = async() => {
    try {
      const filas = {
        measurement: 'mediciones',
        tags: {
          idsensor: idsensores[_.random(0,1)],
        },
        fields: {},
      };
      filas.fields[tipos[0]] = _.random(12, 49.9)
      await cliente.writePoints([filas]);
      console.log('Se ha guardado correctamente!');
    } catch (err) {
      console.log(`Se ha producido un error ${err}`);
    }
};

loadUsuario()
loadMota()
loadSensor()
setInterval(() => {
    loadMedicion()
}, 2000);