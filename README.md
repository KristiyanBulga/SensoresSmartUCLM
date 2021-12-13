# Sensores Smart UCLM
## Paquetes necesarios 
* __NodeJs__: para crear el servidor
* __InfluxDB__: la base de datos usada
* __Aedes__: para crear el broker mqtt
* __Otros paquetes usados que requiera el servidor__

## Archivos
* __app.js___: Fichero principal del servidor
* __borrarBase.js__: Script que borra las tablas que hemos usado
* __datosPrueba.js__: Script que nos genera una base de datos de prueba. Irá metiendo una medición random cada dos segundos (Hay que dejarlo un rato si queremos tener muchos datos de mediciones de prueba).
* __modelo.js__: Script que se encarga de recoger datos de la base de datos que hemos generado con InfluxDB.
* __m_broker.js__: Script que abre un broker en un puerto especifico
* __m_sub.js__: Script que genera un subscriptor conectado al broker que se conecta a un canal a la espera de mensajes.
* __m_pub.js__: Scrip que genera un publicador, que mandará información usando un canal del broker.
