import { generatedArticles } from "./articles.generated";

export type ArticleEntry = {
  type: "article";
  slug: string;
  title: string;
  date: string;
  body: string;
  readingMinutes: number;
  telegramPostId?: number;
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
  telegramChannel?: string;
};

export const profile: Profile = {
  name: "N.Zenkov",
  bio: "Инженер. Пишу про всё, о чём хочу рассказать. Этот сайт — мой блокнот.",
  email: "hi@cm4ker.ru",
  github: "github.com/cm4ker",
  telegramChannel: "cm4ker_thoughts",
};

export const entries: Entry[] = [
  {
    type: "talk",
    title: "Построение семантического поиска по документации с использованием Semantic Kernel и Kernel Memory",
    date: "2025-09-18",
    venue: "DotNext 2025",
    url: "https://dotnext.ru/archive/2025/talks/4c1cc34793844f799eda61aa0cee7ca4/",
  },
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
  ...generatedArticles,
];
