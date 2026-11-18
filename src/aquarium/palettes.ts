/**
 * Палитры аквариума.
 *
 * Цвета держим приглушёнными и «бумажными»: сцена живёт под текстом статьи,
 * поэтому она не должна перетягивать на себя внимание. Рыбы заданы не одним
 * цветом, а набором тонов (спина, тело, брюхо, контур) — из них и получается
 * объём при раскраске клеток.
 */

export type Theme = "light" | "dark";

export type FishSkin = {
  /** верхняя часть тела — самая тёмная */
  back: string;
  body: string;
  /** брюхо — почти бумага */
  belly: string;
  /** тёмная линия: контур, полосы, жабры */
  line: string;
  fin: string;
  /** блик на чешуе и глазу */
  glint: string;
  eye: string;
};

export type Palette = {
  fish: FishSkin[];
  plant: string[];
  sand: string[];
  rock: string[];
  dust: string;
  /** дымка в центре: она же держит текст читаемым */
  haze: string;
  /** мягкий свет за рыбами */
  glow: string;
  beam: string;
};

const LIGHT_FISH: FishSkin[] = [
  {
    back: "#33495a",
    body: "#5c7488",
    belly: "#8298a8",
    line: "#273a48",
    fin: "#6e8798",
    glint: "#fffdf7",
    eye: "#20272d",
  },
  {
    back: "#6b3f2c",
    body: "#8f5b44",
    belly: "#b8876f",
    line: "#52301f",
    fin: "#9e6a52",
    glint: "#fffaf2",
    eye: "#2a1c14",
  },
  {
    back: "#3a5643",
    body: "#5c7a64",
    belly: "#809e88",
    line: "#2c4434",
    fin: "#6d8c76",
    glint: "#fbfff5",
    eye: "#1c261e",
  },
  {
    back: "#513c5c",
    body: "#7a6489",
    belly: "#9a85a7",
    line: "#3f2e49",
    fin: "#87719a",
    glint: "#fdf8ff",
    eye: "#241c29",
  },
  {
    back: "#624c2b",
    body: "#8a7048",
    belly: "#b49a75",
    line: "#4a391d",
    fin: "#977d55",
    glint: "#fffcf3",
    eye: "#291f10",
  },
];

const DARK_FISH: FishSkin[] = [
  {
    back: "#7b93a8",
    body: "#9db3c6",
    belly: "#cbd8e2",
    line: "#587188",
    fin: "#8ba4ba",
    glint: "#f4f9ff",
    eye: "#0f1419",
  },
  {
    back: "#b0846b",
    body: "#c9a189",
    belly: "#e9d4c4",
    line: "#8a634c",
    fin: "#b8917a",
    glint: "#fff4e8",
    eye: "#180f0a",
  },
  {
    back: "#84a48e",
    body: "#a2bca7",
    belly: "#d1dfd1",
    line: "#63806e",
    fin: "#91ab96",
    glint: "#f4fff4",
    eye: "#0c130e",
  },
  {
    back: "#9c86ab",
    body: "#b7a4c2",
    belly: "#dfd6e4",
    line: "#79658a",
    fin: "#a58fb4",
    glint: "#fbf5ff",
    eye: "#130e18",
  },
  {
    back: "#b39a70",
    body: "#c9b48c",
    belly: "#ecdec6",
    line: "#8a7353",
    fin: "#bda880",
    glint: "#fff9ec",
    eye: "#191308",
  },
];

const LIGHT: Palette = {
  fish: LIGHT_FISH,
  plant: ["#72804f", "#8b945d", "#5d6a42", "#9da572", "#4c5736"],
  sand: ["#c6b89f", "#d2c5ae", "#b9ab90", "#ded4c1"],
  rock: ["#a29b8e", "#b5ae9f", "#8c8578"],
  dust: "#7f7a6d",
  haze: "#f7f5f0",
  glow: "#fffdf4",
  beam: "#fff8e6",
};

const DARK: Palette = {
  fish: DARK_FISH,
  plant: ["#6f805d", "#889970", "#5a6a4b", "#9ead86", "#4c5a3f"],
  sand: ["#3a3730", "#46423a", "#32302a", "#514c42"],
  rock: ["#4a4a46", "#5a5a53", "#3f3f3b"],
  dust: "#9aa3ad",
  haze: "#16161a",
  glow: "#2c3849",
  beam: "#7f9bc0",
};

export function paletteFor(theme: Theme): Palette {
  return theme === "dark" ? DARK : LIGHT;
}
