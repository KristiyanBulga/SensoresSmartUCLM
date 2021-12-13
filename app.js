const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const secretKey = "jwt_secretKey";
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importamos el modulo express
var express = require('express');
// importamos el modulo path
var path = require('path');
// importamos el modulo morgan
var logger = require('morgan');
// Traemos nuestro modelo
var modelo = require("./modelo");
// usamos cookieParser
var cookieParser = require("cookie-parser");
// inicializamos express
var app = express()
// Soporte para objetos JSON
app.use(express.json());
// Support nested JSON object parsing (for more than 2 levels!)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// cargamos el modulo morgan
app.use(logger('dev'));
// definimos la carpeta public donde mostraremos el contenido
app.use(express.static(path.join(__dirname, 'public')));



passport.use(
    new LocalStrategy(
      { usernameField: "correo", passwordField: "password" },
      function (correo, password, cb) {
        return modelo.buscaCorreo(correo)
          .then(function (user) {
            if (!user) {
              return cb({ message: "Email not found" }, false);
            }
            if (!bcryptjs.compareSync(password, user.password)) {
                console.log(password, user.password, password == user.password)
              return cb({ message: "Incorrect password" }, false);
            }
            return cb(null, user);
          })
          .catch(function (err) {
            console.error("ERR STGY", err);
            cb(err);
          });
      }
    )
  );

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secretKey,
      },
      function (jwtPayload, cb) {
        return cb(null, { _id: jwtPayload.id });
      }
    )
  );


// HTTP GET /api/geojsons
// Obtiene los geojsons de todas las motas
app.get("/api/geojsons", function (req, res, next) {
    return modelo.getgeojsons().then(function (geojsons) {
        if (geojsons) return res.json(geojsons);
        else return res.status(500).send({ message: "No se pueden obtener los geojsons" });
    });
});

// HTTP GET /api/geojsons
// Obtiene las mediciones de todos los sensores de la mota especificada
app.get("/api/mediciones/id/:id", function (req, res, next) {
    var mid = req.params.id;
    return modelo.getmediciones(mid).then(function (mediciones) {
        if (mediciones) return res.json(mediciones);
        else return res.status(401).send({ message: "Mota no encontrada" });
    });
});

// HTTP GET /api/geojsons
// Obtiene las 
app.get("/api/miperfil", function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.json(null);
  }
  try {
    const data = jwt.verify(token, secretKey);
    return modelo.getPerfilMotas(data._id).then(function (perfil) {
        if (perfil) return res.json(perfil);
        else return res.status(401).send({ message: "Perfil no encontrado" });
    });
  } catch {
    return res.sendStatus(403);
  }
});

// HTTP GET /api/geojsons
// Obtiene las 
app.get("/api/sensores", function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.json(null);
  }
  try {
    const data = jwt.verify(token, secretKey);
    return modelo.getSensoresMota(data._id, req.headers.mota).then(function (sensores) {
        if (sensores) return res.json(sensores);
        else return res.status(401).send({ message: "Mota no encontrada" });
    });
  } catch {
    return res.sendStatus(403);
  }
});

// HTTP GET /api/geojsons
// Obtiene las 
app.get("/api/motaInfo", function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.json(null);
  }
  try {
    const data = jwt.verify(token, secretKey);
    return modelo.getMotaInfo(data._id, req.headers.mota).then(function (motaInfo) {
        if (motaInfo) return res.json(motaInfo);
        else return res.status(401).send({ message: "Mota no encontrada" });
    });
  } catch {
    return res.sendStatus(403);
  }
});

app.get("/api/usercookie", function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.json(null);
  }
  try {
    const data = jwt.verify(token, secretKey);
    return res.json(data);
  } catch {
    return res.sendStatus(403);
  }
});

// HTTP POST /api/users/signin
// Intenta login al usuario
app.post("/api/users/signin", function (req, res, next) {
    return passport.authenticate(
      "local",
      { session: false },
      function (err, user, info) {
        if (err || !user) {
          console.error(err, user);
          return res.status(401).json(err);
        }
        return req.logIn(user, { session: false }, function (err) {
          if (err) {
            res.status(401).send(err);
          }
          useridFromToken(req, res);
          return res.json(user);
        });
      }
    )(req, res);
});

app.post("/api/saveMota", function (req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.json(null);
  }
  try {
    const data = jwt.verify(token, secretKey);
    var motaData = JSON.parse(req.body.mota)
    return modelo.nombreMotaExiste(data._id, motaData.nombre).then(function (existe) {
      if (existe) return res.status(401).send({ message: "Ya tienes dada de alta una mota con el mismo nombre" });
      else {
        return modelo.saveMota(data._id, motaData).then(function (mota) {
          if (mota) return res.json(mota);
          else return res.json({ message: "No se ha podido guardar la mota" });
        })
      };
    });
  } catch {
    return res.sendStatus(403);
  }
});

  
function useridFromToken(req, res) {
    if (req.user) {
      res.cookie(
        "token",
        jwt.sign({ _id: req.user._id }, secretKey)
      );
      return req.user._id;
    } else {
      res.cookie.removeOne("token");
      return null;
    }
}


// Redireccionamos las peticiones al archivo index.html
app.get(/\/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });

// Añadimos la ruta / a la aplicación
app.get('/', function(req, res){
    // Mostamos mensaje por defecto si no carga la página principal
    res.send("<p>Estamos teniendo dificultades</p>");
});

// Escuchar el puerto 3000
app.listen(3000, function(){
    console.log('Escuchando en el puerto 3000');
});