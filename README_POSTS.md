# Управление контентом

Статьи живут в виде Markdown-файлов в `content/articles/`. При запуске `npm start` или `npm run build` скрипт `scripts/build-content.js` сканирует папку, парсит frontmatter и генерирует `src/data/articles.generated.ts`, который подхватывается приложением.

## Добавить статью

1. Создай файл `content/articles/<slug>.md`. Имя файла = slug в URL (`/post/<slug>`).
2. Заполни frontmatter и тело:

```markdown
---
title: Название статьи
date: 2026-05-16
---
Текст в Markdown.

## Подзаголовок

![alt](/images/<slug>/photo.jpg)
```

3. Изображения положи в `public/images/<slug>/` (одна папка на статью), ссылайся как `/images/<slug>/file.jpg`. SVG-диаграммы можно вынести в отдельный файл и подключить через `<inline-svg src="/images/<slug>/diagram.svg" />` — build-скрипт инлайнит содержимое в выводе, чтобы `currentColor` адаптировался к теме.
4. Запусти `npm start` — статья появится в ленте, сортировка идёт по дате (новые сверху).

## Обновить вручную без `start`/`build`

```
npm run content:build
```

Перегенерирует `src/data/articles.generated.ts` из текущих `.md`.

## Frontmatter

| Поле   | Обязательно | Описание                                                 |
|--------|-------------|----------------------------------------------------------|
| title  | да*         | Заголовок. Если пропустить — будет использован slug.     |
| date   | да          | `YYYY-MM-DD`. Используется для сортировки и отображения. |
| slug   | нет         | Переопределяет имя файла. Обычно не нужно.               |

## Выступления и работа

`talk` и `work` остаются структурированными — правь напрямую в `src/data/entries.ts`. Markdown-механизм только для статей с длинным телом.

## Поддерживаемый Markdown

См. [MARKDOWN_GUIDE.md](MARKDOWN_GUIDE.md) — стандартный CommonMark через `react-markdown`.
