export interface CalculatorContent {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export const CALCULATOR_CONTENT: Record<string, CalculatorContent> = {
  "calculadora-reforma-bano": {
    metaTitle: "Calculadora de reforma de baño: precio orientativo",
    metaDescription:
      "Explora una estimación provisional del coste de reformar un baño según metros, calidad y elementos. Resultado orientativo por partidas.",
    heading: "Cuánto cuesta reformar un baño",
    intro:
      "Un baño es la reforma más frecuente y también la que peor se intuye: los mismos metros pueden costar el doble según lo que haya que tirar. Dinos el alcance, los metros y la calidad, y te damos el rango partida a partida para que sepas qué preguntar cuando pidas presupuesto.",
    highlights: [
      "Alicatado, suelo, sanitarios, ducha, mueble y grifería, cada uno como partida separada con su precio.",
      "Estima la superficie de pared a alicatar a partir de los metros del baño.",
      "Diferencia entre acabado básico, medio y premium para el mismo proyecto.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta reformar un baño de 5 m²?",
        answer:
          "Depende del alcance y la calidad. Al terminar el formulario verás el rango calculado para tus metros y tu acabado. Como referencia, cambiar solo el mueble o los sanitarios reduce mucho el importe frente a una reforma completa.",
      },
      {
        question: "¿Qué partidas encarecen más la reforma de un baño?",
        answer:
          "La fontanería, la electricidad y la demolición con retirada de escombros son las partidas con más peso cuando se rehace todo. Los revestimientos y el mobiliario tienen un impacto más lineal y fácil de presupuestar.",
      },
      {
        question: "¿La estimación incluye la retirada de escombros?",
        answer:
          "Puedes incluirla como elemento dentro del paso de elementos. Si no la marcas, el cálculo no la contempla, así que revísalo si vas a demoler el baño actual.",
      },
    ],
  },
  "calculadora-reforma-cocina": {
    metaTitle: "Calculadora de reforma de cocina: precio orientativo",
    metaDescription:
      "Explora una estimación provisional del coste de reformar una cocina según metros, muebles, encimera y electrodomésticos.",
    heading: "Cuánto cuesta reformar una cocina",
    intro:
      "La cocina es donde más se nota la diferencia entre un tipo de cambio y otro: muebles, encimera y electrodomésticos tienen precios muy distintos, y cambiarlo todo no cuesta lo mismo que cambiar una sola cosa. Elige el alcance y te lo desglosamos partida a partida.",
    highlights: [
      "Separa muebles, encimera, electrodomésticos, fregadero y salpicadero.",
      "Estima los metros lineales de mueble a partir de la superficie de la cocina.",
      "Incluye fontanería, electricidad y demolición como elementos opcionales.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta una cocina completa de 10 m²?",
        answer:
          "El rango depende sobre todo de la calidad de los muebles y los electrodomésticos. Al completar el formulario verás el rango para los metros y el acabado que elijas, con el desglose de cada partida.",
      },
      {
        question: "¿Merece la pena cambiar solo la encimera?",
        answer:
          "Es una de las reformas más económicas y de mayor impacto visual. En el alcance 'solo encimera' el cálculo se limita a esa partida y a la mano de obra asociada.",
      },
      {
        question: "¿Los electrodomésticos están incluidos?",
        answer:
          "Solo si marcas ese elemento. El cálculo contempla un conjunto básico de horno, placa y campana, ajustado al nivel de calidad elegido.",
      },
    ],
  },
  "calculadora-reforma-integral": {
    metaTitle: "Calculadora de reforma integral: precio por m²",
    metaDescription:
      "Explora una estimación provisional de reforma integral según metros construidos y acabados, con desglose por partidas.",
    heading: "Cuánto cuesta una reforma integral",
    intro:
      "Una reforma integral toca toda la vivienda y es donde el orden de magnitud más cambia de una casa a otra. Indica los metros construidos y la calidad, y te damos el coste por m² y el total partida a partida. Puedes calcular la reforma entera o solo una fase: acabados o instalaciones.",
    highlights: [
      "Calcula instalación eléctrica y fontanería por m² de vivienda.",
      "Estima suelos, pintura de paredes y techos y puertas interiores.",
      "Permite incluir cocina completa y baño(s) dentro del total.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta una reforma integral de un piso de 80 m²?",
        answer:
          "El precio por m² varía según los acabados y el estado de las instalaciones. Al terminar el formulario verás el rango total y el coste por m² para la superficie y la calidad que elijas.",
      },
      {
        question: "¿Se pueden hacer reformas integrales por fases?",
        answer:
          "Sí, y suele ser habitual. Puedes usar esta calculadora por partes: primero acabados y después instalaciones, o al contrario, para ajustar el presupuesto a cada fase.",
      },
      {
        question: "¿La estimación incluye muebles a medida?",
        answer:
          "No. El cálculo contempla una cocina completa como partida global, pero no mobiliario a medida ni climatización, que dependen de un proyecto específico.",
      },
    ],
  },
  "calculadora-pintar-piso": {
    metaTitle: "Calculadora para pintar un piso: precio por m²",
    metaDescription:
      "Explora una estimación provisional para pintar una vivienda según superficie, acabado y trabajos de preparación.",
    heading: "Cuánto cuesta pintar un piso",
    intro:
      "Pintar es la reforma más rápida y económica, y la que más sorprende cuando el precio no cuadra con lo que te dijeron por teléfono. Señala qué pintas, cuántos metros son y si hay que preparar la superficie antes. El resultado sale por m², con material y mano de obra.",
    highlights: [
      "Diferencia entre pintar paredes, techos o toda la vivienda.",
      "Añade preparación de superficie, imprimación o pintura antihumedad.",
      "Precio por m² con material y mano de obra incluidos.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta pintar un piso de 90 m²?",
        answer:
          "El importe depende de si pintas solo paredes o también techos y del estado de la superficie. Introduce los metros totales a pintar para obtener el rango con la calidad que elijas.",
      },
      {
        question: "¿Hace falta imprimación siempre?",
        answer:
          "No es obligatoria, pero recomendable cuando la pared está muy absorbente, tiene manchas o cambia de color de forma radical. Puedes añadirla como extra en el último paso.",
      },
      {
        question: "¿El precio incluye mover muebles?",
        answer:
          "No. La estimación cubre pintura y mano de obra. Los trabajos de vaciado, protección de mobiliario y limpieza final deben acordarse aparte con el profesional.",
      },
    ],
  },
};

export function getCalculatorContent(slug: string): CalculatorContent | undefined {
  return CALCULATOR_CONTENT[slug];
}
