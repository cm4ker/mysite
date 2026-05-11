export type ArticleEntry = {
  type: "article";
  slug: string;
  title: string;
  date: string;
  body: string;
};

export type TalkEntry = {
  type: "talk";
  title: string;
  date: string;
  venue: string;
  url?: string;
};

export type WorkEntry = {
  type: "work";
  title: string;
  company: string;
  date: string;
  until?: string | null;
};

export type Entry = ArticleEntry | TalkEntry | WorkEntry;

export type Profile = {
  name: string;
  bio: string;
  email?: string;
  github?: string;
  twitter?: string;
};

export const profile: Profile = {
  name: "N.Zenkov",
  bio: "Инженер. Пишу про код, продукт и привычки. Этот сайт — мой блокнот в открытую.",
  email: "hi@cm4ker.ru",
  github: "github.com/cm4ker",
};

export const entries: Entry[] = [
  {
    type: "work",
    title: ".NET Developer",
    company: "Dynamicsun",
    date: "2022-06-01",
    until: null,
  },
  {
    type: "work",
    title: "Senior Developer",
    company: "Freelance",
    date: "2021-02-01",
    until: "2022-06-01",
  },
  {
    type: "work",
    title: "Teamlead",
    company: "Pharma Trade Service",
    date: "2020-02-01",
    until: "2021-02-01",
  },
  {
    type: "work",
    title: "Senior C# Developer",
    company: "ASNA",
    date: "2017-02-01",
    until: "2020-02-01",
  },
  {
    type: "work",
    title: "Teamlead",
    company: "Omskoe lekarstvo",
    date: "2015-10-01",
    until: "2017-02-01",
  },
  {
    type: "work",
    title: "Middle 1С Developer",
    company: "FTO",
    date: "2013-08-01",
    until: "2015-10-01",
  },
  {
    type: "work",
    title: "Junior C# Developer",
    company: "Medexport",
    date: "2011-01-01",
    until: "2013-04-01",
  },
  {
    type: "article",
    slug: "site-redesign",
    title: "Обновление дизайна",
    date: "2025-11-04",
    body: `Решил переверстать сайт, как по мне вышло не плохо.

Давно уже хотел этим заняться, но всё никак руки не доходили, да и времени не было.

Наступили большие выходные, и я подумал — "А почему бы не писать сайт с нуля, а завайбкодить его".

## Процесс работы

В принципе задача не требует большой модерации. Я посидел, почесал голову и решил сделать красиво.

## Прошлый вариант

![Старый](/images/old-site.png)

Вот эту версию я делал за 4 часа суммарно с помощью Stackoverflow-кодинг. Вооружившись Github Copilot я с помощью Claude (читается как "клод") Sonnet 4.5 отправился в плавание.

Идея с миллиметровкой на фоне мне показалась очень интересной, поэтому начал с неё, затем попросил сделать основные блоки.

Дальше было достаточно просто:

- Перенос контента
- Некоторые мелкие недостатки с цветом исправил вручную
- Микроблог
- Проверил что оно там наговнокодило

К сожалению я не сохранил промежуточных результатов, но описание работы списком мне не сильно приглянулось и я решил, что лучше будет выглядеть это в виде timeline'a.

После этого нужно было выбрать шрифт, то я сразу же вспомнил про [excalidraw](https://excalidraw.com). Это крутой проект про рисование диаграмм в приятном человеческом стиле.

## Результат

![Новый](/images/new-site.png)

Как по мне результат получился хороший. Мне нравится.`,
  },
];
