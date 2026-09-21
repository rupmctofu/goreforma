export interface CalculatorContent {
  metaTitle: string;
  metaDescription: string;
  intro: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export const CALCULATOR_CONTENT: Record<string, CalculatorContent> = {
  "calculadora-reforma-bano": {
    metaTitle: "Calculadora de reforma de baño: precio orientativo",
    metaDescription:
      "Calcula cuánto cuesta reformar un baño en España según metros, calidad y elementos. Estimación orientativa por partidas en menos de 2 minutos.",
    intro:
      "Reformar un baño es una de las obras más habituales y también una de las que más varía de precio según el estado de las instalaciones y los acabados elegidos. En esta calculadora puedes partir del alcance que quieres (reforma completa, suelo y azulejos, sanitarios o mueble) e ir ajustando los metros y los elementos a cambiar para obtener un rango orientativo por partidas.",
    highlights: [
      "Incluye alicatado, suelo, sanitarios, ducha, mueble y grifería como partidas separadas.",
      "Estima la superficie de pared a alicatar a partir de los metros del baño.",
      "Diferencia entre acabado básico, medio y premium para el mismo proyecto.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta reformar un baño de 5 m²?",
        answer:
          "Depende del alcance y la calidad. Una reforma completa de 5 m² con acabados medios suele moverse en un rango amplio que verás calculado al terminar el formulario. Cambiar solo el mueble o los sanitarios reduce mucho el importe frente a una reforma integral.",
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
      "Calcula cuánto cuesta reformar una cocina en España según metros, muebles, encimera y electrodomésticos. Rango orientativo por partidas al instante.",
    intro:
      "La cocina concentra muchas partidas distintas: muebles, encimera, electrodomésticos, fontanería, electricidad y revestimientos. Esta calculadora te permite elegir entre una cocina completa o cambios parciales (solo muebles, solo electrodomésticos o solo encimera) y ajustar la superficie para estimar los metros lineales de mobiliario.",
    highlights: [
      "Separa muebles, encimera, electrodomésticos, fregadero y salpicadero.",
      "Estima los metros lineales de mueble a partir de la superficie de la cocina.",
      "Incluye fontanería, electricidad y demolición como elementos opcionales.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta una cocina completa de 10 m²?",
        answer:
          "El rango depende sobre todo de la calidad de los muebles y los electrodomésticos. Al completar el formulario verás el rango orientativo para los metros y el acabado que elijas, con el desglose de cada partida.",
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
      "Calcula cuánto cuesta una reforma integral de vivienda en España según metros construidos y acabados. Estimación orientativa con desglose por partidas.",
    intro:
      "Una reforma integral toca toda la vivienda: derribos, instalaciones, suelos, pintura, carpintería y, con frecuencia, cocina y baños. Aquí puedes calcular el coste completo o limitarlo a acabados o a instalaciones, indicando los metros construidos para estimar el número de puertas, baños y superficies de trabajo.",
    highlights: [
      "Calcula instalación eléctrica y fontanería por m² de vivienda.",
      "Estima suelos, pintura de paredes y techos y puertas interiores.",
      "Permite incluir cocina completa y baño(s) dentro del total.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta una reforma integral de un piso de 80 m²?",
        answer:
          "El precio por m² varía según acabados y el estado de las instalaciones. Al terminar el formulario verás el rango total y el coste por m² para tu superficie y calidad elegidas.",
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
      "Calcula cuánto cuesta pintar un piso en España según los metros a pintar, el acabado y los trabajos de preparación. Rango orientativo al instante.",
    intro:
      "Pintar es la reforma más rápida y económica, pero el precio cambia mucho según la superficie, el estado de las paredes y si se pintan también los techos. Esta calculadora parte de los metros totales a pintar y permite añadir reparación de grietas, imprimación selladora o pintura específica para zonas húmedas.",
    highlights: [
      "Diferencia entre pintar paredes, techos o toda la vivienda.",
      "Añade preparación de superficie, imprimación o pintura antihumedad.",
      "Precio por m² con material y mano de obra incluidos.",
    ],
    faqs: [
      {
        question: "¿Cuánto cuesta pintar un piso de 90 m²?",
        answer:
          "El importe depende de si pintas solo paredes o también techos y del estado de la superficie. Introduce los metros totales a pintar para obtener el rango orientativo con el acabado que elijas.",
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