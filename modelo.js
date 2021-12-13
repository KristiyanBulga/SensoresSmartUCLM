// cargamos los paquetes necesarios
const Influx = require('influx');
const { last, result } = require('lodash');

// creamos el cliente Influx
const cliente = new Influx.InfluxDB({
  database: 'sensoresDB',
  host: process.env.HOST,
  port: 8086,
  // username: process.env.UNAME,
  //password: process.env.PASSWORD,
});

const cod = {
  "a":"99","b":"98","c":"97","d":"96","e":"95","f":"94","g":"93","h":"92","i":"91","j":"90","k":"89","l":"88","m":"87","n":"86","ñ":"85",
  "o":"84","p":"83","q":"82","r":"81","s":"80","t":"79","u":"78","v":"77","w":"76","x":"75","y":"74","z":"73","A":"59","B":"58","C":"57",
  "D":"56","E":"55","F":"54","G":"53","H":"52","I":"51","J":"50","K":"49","L":"48","M":"47","N":"46","Ñ":"45","O":"44","P":"43","Q":"42",
  "R":"41","S":"40","T":"39","U":"38","V":"37","W":"36","X":"35","Y":"34","Z":"33","99":"a","98":"b","97":"c","96":"d","95":"e","94":"f",
  "93":"g","92":"h","91":"i","90":"j","89":"k","88":"l","87":"m","86":"n","85":"ñ","84":"o","83":"p","82":"q","81":"r","80":"s","79":"t",
  "78":"u","77":"v","76":"w","75":"x","74":"y","73":"z","59":"A","58":"B","57":"C","56":"D","55":"E","54":"F","53":"G","52":"H","51":"I",
  "50":"J","49":"K","48":"L","47":"M","46":"N","45":"Ñ","44":"O","43":"P","42":"Q","41":"R","40":"S","39":"T","38":"U","37":"V","36":"W",
  "35":"X","34":"Y","33":"Z","0":"10","1":"11","2":"12","3":"13","4":"14","5":"15","6":"16","7":"17","8":"18","9":"19","10":"0","11":"1",
  "12":"2", "13":"3","14":"4","15":"5","16":"6","17":"7","18":"8", "19":"9",
}

codify = function(code) {
  var result = ""
  for (let i = 0; i < code.length; i++) {
    result += cod[code[i]]
  }
  return result
}
decodify = function(code) {
  var result = ""
  for (let i = 0; i < code.length/2; i++) {
    result += cod[code.substring(i*2, (i+1)*2)]
  }
  return result
}

Modelo = {};

// Realiza la llamada correspondiente al servidor
// Obtiene la lista de motas, junto a toda su información si:
// - tiene sensores dados de alta
// - tiene al menos un sensor en público
// - al menos uno de los sensores público tiene mediciones
Modelo.getgeojsons = async function () {
  // creamos la lista que contendrá los geojsons
  var geojsons = []
  // cogemos todas las motas
  var motas = await cliente.query("SELECT * FROM motas")
  // por cada mota buscamos los sensores que se pueden mostrar al público
  for (const mota of motas) {
    var geojson = {
      "type":"Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [parseFloat(mota.y), parseFloat(mota.x), parseFloat(mota.z)]
      },
      "properties": {
        "Mota": mota.nombre,
        "Direccion": mota.direccion,
      },
      "idmota": mota.id
    };
    var sensores = await cliente.query("SELECT * FROM sensores WHERE idmota = '" + mota.id + "' and mostrar = 1")
    // por cada sensor buscamos las últimas mediciones realizadas
    for (const sensor of sensores) {
      var mediciones = await cliente.query("SELECT last(*) FROM mediciones WHERE idsensor = '"+ sensor.id +"'")
      // por cada medición almacenamos la información en "properties"
      mediciones.forEach(medicion => {
        geojson["properties"][sensor.nombre] = medicion["last_" + sensor.tipo]
      });
    };
    // Si la longitud de properties es mayor de 2 significa que hemos encontrado motas que cumplen las reglas mencionadas
    if(Object.keys(geojson["properties"]).length > 2){
      geojson.idmota = codify(geojson.idmota.substring(2))
      geojsons.push(geojson)
    }
  };
  return geojsons
};

// Realiza la llamada correspondiente al servidor
// Obtiene las mediciones realizadas por cada sensor público de la mota
// Esta función se supone que siempre se llamará desde el mapa por lo que los sensores de la mota tienen mediciones y se pueden mostrar al público
Modelo.getmediciones = async function (mid) {
  const middecod = "m_" + decodify(mid)
  // creamos el objeto
  info = {"medidas": [],
    "tiempos": [],
    "mota": {}}
  // seleccionamos la información de la mota
  var mota = await cliente.query("SELECT * FROM motas WHERE id = '" + middecod + "'");
  info.mota["nombre"] = mota[0].nombre;
  info.mota["direccion"] = mota[0].direccion;
  // buscamos los sensores que están al público
  var sensores = await cliente.query("SELECT * FROM sensores WHERE idmota = '" + middecod + "' and mostrar = 1");
  for (const sensor of sensores) {
    // seleccionamos las mediciones realizadas por cada sensor
    var mediciones = await cliente.query("SELECT * FROM mediciones WHERE idsensor = '"+ sensor.id +"'");
    var tiempos = ["tiempos_" + codify(sensor.id.substring(2))]
    var medidas = [sensor.nombre]
    mediciones.forEach(medicion => {
      var tiempo = new Date(medicion.time._nanoISO)
      tiempo = tiempo.toISOString()
      tiempo = tiempo.replace('T', ' ')
      tiempos.push(tiempo)
      medidas.push(medicion[sensor.tipo])
    });
    // si hay mas de una medición se añade al objeto
    if (tiempos.length > 1 && medidas.length > 1)
    {
      info.medidas.push(medidas)
      info.tiempos.push(tiempos)
    }
  };
  return info
}

Modelo.buscaCorreo = async function (correo) {
  const resultados = await cliente.query("SELECT * FROM usuarios WHERE correo = '" + correo + "'");
  if (typeof resultados[0] != "undefined") {
    var user = {}
    user["_id"] = codify(resultados[0].id.substring(2))
    user["correo"] = resultados[0].correo
    user["password"] = resultados[0].password
    user["nombre"] = resultados[0].nombre
    user["apellido1"] = resultados[0].apellido1
    user["apellido2"] = resultados[0].apellido2
    return user
  }
  return null;
}

Modelo.getPerfilMotas = async function (uid){
  var uiddecoded = "u_" + decodify(uid);
  const resultados = await cliente.query("SELECT * FROM usuarios WHERE id = '" + uiddecoded + "'");
  var result = {perfil: {}, motas: []}
  result.perfil["correo"] = resultados[0].correo
  result.perfil["nombre"] = resultados[0].nombre
  result.perfil["apellido1"] = resultados[0].apellido1
  result.perfil["apellido2"] = resultados[0].apellido2
  const motas = await cliente.query("SELECT * FROM motas WHERE idusuario = '" + uiddecoded + "'");
  for (const mota of motas) {
    var data = {
      nombre: mota.nombre,
      direccion: mota.direccion,
      x: mota.x,
      y: mota.y,
      z: mota.z,
      id: codify(mota.id.substring(2)),
    }
    result.motas.push(data)
  }
  return result;
}

Modelo.getSensoresMota = async function(uid, mid){
  var uiddecoded = "u_" + decodify(uid);
  var middecoded = "m_" + decodify(mid);
  const mota = await cliente.query("SELECT * FROM motas WHERE idusuario = '" + uiddecoded + "' and id = '" + middecoded +"'");
  if (typeof mota[0] != "undefined") {
    var result = {mota: {}, sensores: []}
    var data = {
      nombre: mota[0].nombre,
      direccion: mota[0].direccion,
      x: mota[0].x,
      y: mota[0].y,
      z: mota[0].z,
      id: codify(mota[0].id.substring(2)),
    }
    result.mota = data
    const sensores = await cliente.query("SELECT * FROM sensores WHERE idmota = '" + middecoded + "'");
    for (const sensor of sensores) {
      var data = {
        nombre: sensor.nombre,
        tipo: sensor.tipo,
        unidad: sensor.unidad,
        id: codify(sensor.id.substring(2)),
        mostrar: sensor.mostrar,
        info: "",
      }
      // seleccionamos las mediciones realizadas por cada sensor
      var mediciones = await cliente.query("SELECT * FROM mediciones WHERE idsensor = '"+ sensor.id +"'");
      var tiempos = ["tiempos_" + codify(sensor.id.substring(2))]
      var medidas = [sensor.nombre]
      mediciones.forEach(medicion => {
        var tiempo = new Date(medicion.time._nanoISO)
        tiempo = tiempo.toISOString()
        tiempo = tiempo.replace('T', ' ')
        tiempos.push(tiempo)
        medidas.push(medicion[sensor.tipo])
      });
      // si hay mas de una medición se añade al objeto
      if (tiempos.length > 1 && medidas.length > 1)
      {
        var info = {medidas, tiempos}
        data.info = JSON.stringify(info)
      }
      result.sensores.push(data)
    }
    return result;
  }
  else{
    return null;
  }
}

Modelo.getMotaInfo = async function(uid, mid){
  var uiddecoded = "u_" + decodify(uid);
  var middecoded = "m_" + decodify(mid);
  const mota = await cliente.query("SELECT * FROM motas WHERE idusuario = '" + uiddecoded + "' and id = '" + middecoded +"'");
  if (typeof mota[0] != "undefined") {
    var result = {mota: {}, sensores: []}
    var data = {
      nombre: mota[0].nombre,
      direccion: mota[0].direccion,
      x: mota[0].x,
      y: mota[0].y,
      z: mota[0].z,
      id: codify(mota[0].id.substring(2)),
    }
    result.mota = data
    return result;
  }
  else{
    return null;
  }
}

Modelo.nombreMotaExiste = async function (uid, nombreMota){
  var uiddecoded = "u_" + decodify(uid);
  var resultados = await cliente.query("SELECT * FROM motas WHERE idusuario = '" + uiddecoded +"'");
  var existenombre = false;
  resultados.forEach(element => {
    existenombre = existenombre || nombreMota == element.nombre;
  });
  return existenombre;
}

Modelo.saveMota = async function(uid, mota){
  var uiddecoded = "u_" + decodify(uid);
  mota.idusuario = uiddecoded;
  if (mota.id == null) {
    mota.id = 'm_' + Math.random().toString(36).substr(2, 9)
  }
  return Modelo.addMota(mota)
}

// función que se encarga de dar de alta una nueva mota
Modelo.addMota = async function(mota) {
  try {
    // si no existe nos aseguramos que el identificador sea único
    var resultados = await cliente.query("SELECT count(*) FROM motas WHERE id = '" + mota.id + "'");
    while (typeof resultados[0] !== "undefined") {
      mota.id = 'm_' + Math.random().toString(36).substr(2, 9)
      resultados = await cliente.query("SELECT count(*) FROM motas WHERE id = '" + mota.id + "'");
    }
    const filas = [{
      measurement: 'motas',
      tags: {
        id: mota.id,
        idusuario: mota.idusuario,
        nombre: mota.nombre,
        direccion: mota.direccion,
        x: mota.x,
        y: mota.y,
        z: mota.z,
      },
      fields: {entrado : 0, },
    }];
    if (mota.time != null) {
      measurement[0].timestamp = mota.time;
    }
    await cliente.writePoints(filas);
    console.log('Se ha guardado correctamente la mota');
    return {mota: "guardada"}
    
  } catch (err) {
    console.log(`Se ha producido un error ${err}`);
    return null
  }
};


module.exports = Modelo;