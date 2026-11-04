/*
  SHAPES PUBLICADOS PELO PROFESSOR
  Este arquivo é gerado pelo botão "Exportar shapes.js" no Modo edição.
  Para publicar, substitua este arquivo pelo exportado e envie para o GitHub.

  Cada bolinha (dots) tem:  s = corda (0 = corda mais grave), f = casa,
  k = tipo: r tônica, n nota, c característica, d destaque, p passagem (vazada)
  lb = intervalo (opcional), t = texto livre (opcional)
*/
window.SHAPES = [
  {
    "id": "exemplo-blues-la",
    "titulo": "Blues em Lá · forma 1",
    "descricao": "Exemplo. Pentatônica menor com a blue note (b5) em azul. Comece pela tônica na 6ª corda, casa 5.",
    "instrumento": "violao", "tonica": "A", "casaInicial": 5, "casas": 5, "semRotulo": false,
    "dots": [
      {"s":0,"f":5,"k":"r"},{"s":0,"f":8,"k":"n"},
      {"s":1,"f":5,"k":"n"},{"s":1,"f":6,"k":"c","lb":"b5"},{"s":1,"f":7,"k":"n"},
      {"s":2,"f":5,"k":"n"},{"s":2,"f":7,"k":"r"},
      {"s":3,"f":5,"k":"n"},{"s":3,"f":7,"k":"n"},{"s":3,"f":8,"k":"c","lb":"b5"},
      {"s":4,"f":5,"k":"n"},{"s":4,"f":8,"k":"n"},
      {"s":5,"f":5,"k":"r"},{"s":5,"f":8,"k":"n"}
    ]
  },
  {
    "id": "exemplo-exercicio-do-maior",
    "titulo": "Exercício · escreva os intervalos",
    "descricao": "Exemplo de exercício com rótulos escondidos. Dó maior, forma A do CAGED. A tônica está em laranja.",
    "instrumento": "violao", "tonica": "C", "casaInicial": 2, "casas": 5, "semRotulo": true,
    "dots": [
      {"s":0,"f":3,"k":"n"},{"s":0,"f":5,"k":"n"},
      {"s":1,"f":2,"k":"n"},{"s":1,"f":3,"k":"r"},{"s":1,"f":5,"k":"n"},
      {"s":2,"f":2,"k":"n"},{"s":2,"f":3,"k":"n"},{"s":2,"f":5,"k":"n"},
      {"s":3,"f":2,"k":"n"},{"s":3,"f":4,"k":"n"},{"s":3,"f":5,"k":"r"},
      {"s":4,"f":3,"k":"n"},{"s":4,"f":5,"k":"n"},{"s":4,"f":6,"k":"n"},
      {"s":5,"f":3,"k":"n"},{"s":5,"f":5,"k":"n"}
    ]
  }
];
