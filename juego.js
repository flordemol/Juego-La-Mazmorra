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
  var color;
  for (y = 0; y < escenario.length; y++) {
    for (x = 0; x < escenario[0].length; x++) {
      if (escenario[y][x] == 0) color = muro;
      if (escenario[y][x] == 1) color = puerta;
      if (escenario[y][x] == 2) color = tierra;
      if (escenario[y][x] == 3) color = llave;

      ctx.fillStyle = color;
      ctx.fillRect(x * anchoFicha, y * altoFicha, anchoFicha, altoFicha); // dibuja rectangulo, se le pasan las medidas (desde la coordenada) y las coordenadas
    }
  }
}

// Plantilla del Objeto Jugador
var jugador = function () {
  // Punto de partida
  this.x = 1;
  this.y = 1;
  this.color = "#820c01";
  this.llave = false;

  this.dibuja = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x * anchoFicha,
      this.y * altoFicha,
      anchoFicha,
      altoFicha
    );
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
    this.x = 1;
    this.y = 1;
    this.llave = false;
    escenario[8][3] = 3;
  };

  this.logicaObjetos = function () {
    var objeto = escenario[this.y][this.x];
    // OBTIENE LLAVE
    if (objeto == 3) {
      this.llave = true;
      escenario[this.y][this.x] = 2;
      console.log("Has obtenido la llave!!!");
    }

    // ABRIMOS LA PUERTA
    if (objeto == 1) {
      if (this.llave == true) {
        this.victoria();
      } else {
        console.log("Te falta la llave! No puedes pasar");
      }
    }
  };
};

var protagonista;

// Primera función que se ejecuta luego de cargado el body
// Identifica canvas y contexto y llama al intervalo en el que se ejecutará la función principal
function inicializa() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // Crear Objeto Jugador
  protagonista = new jugador();

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
  protagonista.dibuja();
}
