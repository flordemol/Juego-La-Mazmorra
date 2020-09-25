var canvas; // Lienzo
var ctx; // Contexto del Canvas
var FPS = 50; // Fotogramas por segundo

// Definir tamaño de fichas
var anchoFicha = 50;
var altoFicha = 50;

// Colores Fichas
var muro = "#044f14";
var puerta = "#3a1700";
var tierra = "#c6892f";
var llave = "#c6bc00";

var protagonista;

var enemigo = [];

var imagenAntorcha;

var tileMap;

// Definir escenario
var escenario = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 2, 2, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0],
  [0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 1, 0, 0, 2, 0],
  [0, 2, 2, 3, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Función que dibuja el escenario en la pantalla
function dibujaEscenario() {
  for (y = 0; y < escenario.length; y++) {
    for (x = 0; x < escenario[0].length; x++) {
      var tile = escenario[y][x]; // Donde se va a dibujar

      ctx.drawImage(
        tileMap,
        tile * 32,
        0,
        32,
        32,
        anchoFicha * x,
        altoFicha * y,
        anchoFicha,
        altoFicha
      ); // Dibujar tileMap, donde empieza a recortar la imagen (Y fijo, X secuencial), el tamaño del recorte (nuestra imagen es 32x32), donde lo tiene que dibujar, y de qué tamaño
    }
  }
}

// Función que dibuja animación de antorcha
var antorcha = function (x, y) {
  this.x = x;
  this.y = y;

  this.retraso = 10;
  this.contador = 0;
  this.fotograma = 0; //0-3 (cantidad de dibujos que tengo en tileMap)

  this.cambiaFotograma = function () {
    if (this.fotograma < 3) {
      this.fotograma++;
    } else {
      this.fotograma = 0;
    }
  };

  // Dibuja animación
  this.dibuja = function () {
    if (this.contador < this.retraso) {
      this.contador++;
    } else {
      this.contador = 0;
      this.cambiaFotograma();
    }

    ctx.drawImage(
      tileMap,
      this.fotograma * 32, // inicio X secuencial
      64, // Y
      32, // tamaño del corte
      32, // tamaño del corte
      anchoFicha * x, // donde empieza a dibujar
      altoFicha * y, // donde empieza a dibujar
      anchoFicha, // tamaño del dibujo
      altoFicha // tamaño del dibujo
    );
  };
};

// Plantilla del OBJETO ENEMIGO
var malo = function (x, y) {
  this.x = x;
  this.y = y;

  this.direccion = Math.floor(Math.random() * 4);

  this.retraso = 50; // cantidad de fotogramas (que se mueva 1 vez por segundo)
  this.fotograma = 0; // contador (el retraso es el tope)

  this.dibuja = function () {
    ctx.drawImage(
      tileMap,
      0,
      32,
      32,
      32,
      this.x * anchoFicha,
      this.y * altoFicha,
      anchoFicha,
      altoFicha
    );
  };

  this.compruebaColision = function (x, y) {
    var colisiona = false;

    if (escenario[y][x] == 0) {
      colisiona = true;
    }
    return colisiona;
  };

  this.mueve = function () {
    protagonista.colisionEnemigo(this.x, this.y);

    if (this.contador < this.retraso) {
      this.contador++;
    } else {
      this.contador = 0;

      // ARRIBA
      if (this.direccion == 0) {
        if (this.compruebaColision(this.x, this.y - 1) == false) {
          this.y--;
        } else {
          this.direccion = Math.floor(Math.random() * 4);
        }
      }

      // ABAJO
      if (this.direccion == 1) {
        if (this.compruebaColision(this.x, this.y + 1) == false) {
          this.y++;
        } else {
          this.direccion = Math.floor(Math.random() * 4);
        }
      }

      // IZQUIERDA
      if (this.direccion == 2) {
        if (this.compruebaColision(this.x - 1, this.y) == false) {
          this.x--;
        } else {
          this.direccion = Math.floor(Math.random() * 4);
        }
      }

      // DERECHA
      if (this.direccion == 3) {
        if (this.compruebaColision(this.x + 1, this.y) == false) {
          this.x++;
        } else {
          this.direccion = Math.floor(Math.random() * 4);
        }
      }
    }
  };
};

// Plantilla del OBJETO JUGADOR
var jugador = function () {
  // Punto de partida
  this.x = 1;
  this.y = 1;
  this.color = "#820c01";
  this.llave = false;

  this.dibuja = function () {
    ctx.drawImage(
      tileMap,
      32,
      32,
      32,
      32,
      this.x * anchoFicha,
      this.y * altoFicha,
      anchoFicha,
      altoFicha
    );
  };

  // cada vez que se mueva un enemigo, envía sus coordenadas al jugador y se comprueba desde acá (jugador)
  this.colisionEnemigo = function (x, y) {
    if (this.x == x && this.y == y) {
      this.muerte();
    }
  };

  this.margenes = function (x, y) {
    var colision = false;

    if (escenario[y][x] == 0) {
      colision = true;
    }
    return colision;
  };

  this.arriba = function () {
    if (this.margenes(this.x, this.y - 1) == false) {
      this.y--;
      this.logicaObjetos();
    }
  };

  this.abajo = function () {
    if (this.margenes(this.x, this.y + 1) == false) {
      this.y++;
      this.logicaObjetos();
    }
  };

  this.izquierda = function () {
    if (this.margenes(this.x - 1, this.y) == false) {
      this.x--;
      this.logicaObjetos();
    }
  };

  this.derecha = function () {
    if (this.margenes(this.x + 1, this.y) == false) {
      this.x++;
      this.logicaObjetos();
    }
  };

  this.victoria = function () {
    console.log("Has ganado!!");
    alert("Has ganado!!");
    this.x = 1;
    this.y = 1;
    this.llave = false; // el jugador ya no tiene la llave
    escenario[8][3] = 3; // volvemos a poner la llave en su lugar
    document.getElementById("texto").innerHTML = "";
  };

  this.muerte = function () {
    console.log("Has perdido!!");
    alert("Has perdido!!");
    this.x = 1;
    this.y = 1;
    this.llave = false; // el jugador ya no tiene la llave
    escenario[8][3] = 3; // volvemos a poner la llave en su lugar
    document.getElementById("texto").innerHTML = "";
  };

  this.logicaObjetos = function () {
    var objeto = escenario[this.y][this.x];
    // OBTIENE LLAVE
    if (objeto == 3) {
      this.llave = true;
      escenario[this.y][this.x] = 2;
      console.log("Has obtenido la llave!!!");
      document.getElementById("texto").innerHTML = "Has obtenido la llave!!!";
    }

    // ABRIMOS LA PUERTA
    if (objeto == 1) {
      if (this.llave == true) {
        this.victoria();
      } else {
        console.log("Te falta la llave! No puedes pasar");
        alert("Te falta la llave! No puedes pasar");
      }
    }
  };
};

// Primera función que se ejecuta luego de cargado el body
// Identifica canvas y contexto y llama al intervalo en el que se ejecutará la función principal
function inicializa() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  tileMap = new Image();
  tileMap.src = "tilemap.png";

  // CREAMOS AL JUGADOR
  protagonista = new jugador();

  // CREAMOS LA ANTORCHA
  imagenAntorcha = new antorcha(0, 0);

  // CREAMOS LOS ENEMIGOS
  enemigo.push(new malo(2, 7));
  enemigo.push(new malo(6, 7));
  enemigo.push(new malo(7, 4));

  // LECTURA DEL TECLADO
  document.addEventListener("keydown", function (tecla) {
    // Arriba
    if (tecla.keyCode == 38) {
      protagonista.arriba();
    }

    // Abajo
    if (tecla.keyCode == 40) {
      protagonista.abajo();
    }

    // Izquierda
    if (tecla.keyCode == 37) {
      protagonista.izquierda();
    }

    // Derecha
    if (tecla.keyCode == 39) {
      protagonista.derecha();
    }
  });

  // Intervalo
  setInterval(function () {
    principal();
  }, 1000 / FPS);
}

// Para simular movimiento se borra canvas en cada fotograma
function borraCanvas() {
  canvas.width = 750;
  canvas.height = 500;
}

// Funciones que se ejecutan al iniciar el programa y que se repetirán de acuerdo al intervalo definido
function principal() {
  borraCanvas();
  dibujaEscenario();
  imagenAntorcha.dibuja();
  protagonista.dibuja();

  for (c = 0; c < enemigo.length; c++) {
    enemigo[c].mueve();
    enemigo[c].dibuja();
  }
}
