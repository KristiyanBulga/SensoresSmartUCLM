// broker MQTT
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
var port = 1883;

// función que inicializa el broker
const startBroker = function() {
    return new Promise((res, rej) => {
        server.listen(port, function () {
            console.log(`MQTT Broker started on port ${port}`);
            return res()
        });
    })
};

(async function () {
    try {
      await startBroker();
    } catch (e) {
      console.error("ERROR: ", e);
      process.exit();
    }
  })();