Modelo = {};

Modelo.mota = null;

Modelo.edit = false;

// Obtiene la lista de motas, junto a toda su información si:
// - tiene sensores dados de alta
// - tiene al menos un sensor en público
// - al menos uno de los sensores público tiene mediciones
Modelo.getgeojsons = function() {
    return $.ajax({
        url: "/api/geojsons", 
        method: "GET" 
    });
};

// Obtiene las mediciones realizadas por cada sensor público de la mota
Modelo.getmediciones = function (mid) {
    return $.ajax({
        url: "/api/mediciones/id/" + mid, 
        method: "GET" 
    });
};

// Obtiene 
Modelo.getPerfilMotas = function () {
  return $.ajax({
      url: "/api/miperfil", 
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", Modelo.getToken());
      }, 
  });
};

// Obtiene 
Modelo.getSensoresMota = function (mid) {
  return $.ajax({
      url: "/api/sensores", 
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", Modelo.getToken());
        xhr.setRequestHeader("mota", mid);
      }, 
  });
};

// Obtiene 
Modelo.getMotaInfo = function (mid) {
  return $.ajax({
      url: "/api/motaInfo", 
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", Modelo.getToken());
        xhr.setRequestHeader("mota", mid);
      }, 
  });
};

Modelo.getToken = function () {
    var decoded = decodeURIComponent(document.cookie);
    return decoded.substring(6, decoded.length);
  };

// GET usuario de cookies
Modelo.getUser = function () {
    return $.ajax({
      url: "/api/usercookie",
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", Modelo.getToken());
      },
    });
  };

// Obtiene la información del usuario si los datos son correctos
Modelo.signin = function (correo, password) {
    return $.ajax({
        url: "/api/users/signin",
        method: "POST",
        data: { correo, password },
    });
};

Modelo.signout = function () {
    document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  };

// Obtiene la información del usuario si los datos son correctos
Modelo.saveMota = function (mota) {
  return $.ajax({
      url: "/api/saveMota",
      method: "POST",
      data: { mota },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", Modelo.getToken());
      },
  });
};