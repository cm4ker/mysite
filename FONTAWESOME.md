# Font Awesome Pro - Руководство по использованию

## Установленные пакеты

- `@fortawesome/fontawesome-svg-core` - Ядро библиотеки
- `@fortawesome/react-fontawesome` - React компонент
- `@fortawesome/pro-solid-svg-icons` - Solid иконки (Pro)
- `@fortawesome/pro-regular-svg-icons` - Regular иконки (Pro)
- `@fortawesome/pro-light-svg-icons` - Light иконки (Pro)
- `@fortawesome/free-brands-svg-icons` - Brand иконки (бесплатные)

## Использование в компонентах

### Импорт компонента

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
```

### Базовое использование

```tsx
// Solid иконка
<FontAwesomeIcon icon={['fas', 'rocket']} />

// Regular иконка
<FontAwesomeIcon icon={['far', 'heart']} />

// Light иконка (Pro)
<FontAwesomeIcon icon={['fal', 'lightbulb']} />

// Brand иконка
<FontAwesomeIcon icon={['fab', 'github']} />
```

### Размеры

```tsx
<FontAwesomeIcon icon={['fas', 'star']} size="xs" />
<FontAwesomeIcon icon={['fas', 'star']} size="sm" />
<FontAwesomeIcon icon={['fas', 'star']} size="lg" />
<FontAwesomeIcon icon={['fas', 'star']} size="2x" />
<FontAwesomeIcon icon={['fas', 'star']} size="3x" />
```

### Анимации

```tsx
// Вращение
<FontAwesomeIcon icon={['fas', 'spinner']} spin />

// Пульсация
<FontAwesomeIcon icon={['fas', 'heart']} pulse />
```

### Стилизация

```tsx
// С CSS классом
<FontAwesomeIcon icon={['fas', 'star']} className="gold-star" />

// Со стилями
<FontAwesomeIcon 
  icon={['fas', 'star']} 
  style={{ color: 'gold' }} 
/>
```

## Добавление новых иконок

Чтобы добавить новую иконку в проект:

1. Откройте `src/fontawesome.ts`
2. Импортируйте иконку:
```tsx
import { faYourIcon } from '@fortawesome/pro-solid-svg-icons';
```
3. Добавьте в библиотеку:
```tsx
library.add(faYourIcon);
```

## Префиксы стилей

- `fas` - Font Awesome Solid (Pro)
- `far` - Font Awesome Regular (Pro)
- `fal` - Font Awesome Light (Pro)
- `fab` - Font Awesome Brands (бесплатно)

## Полезные ссылки

- [Font Awesome Icons Gallery](https://fontawesome.com/icons)
- [React Component Documentation](https://fontawesome.com/docs/web/use-with/react)
- [Styling Icons](https://fontawesome.com/docs/web/style/styling)

## Замененные emoji → иконки в проекте

| Компонент | Было | Стало |
|-----------|------|-------|
| Nav | ☀/🌙 | `sun`/`moon` |
| Nav | SVG Search | `search` |
| CommandPalette | 👤 | `user` |
| CommandPalette | 💼 | `briefcase` |
| CommandPalette | 📝 | `file` |
| CommandPalette | 📧 | `envelope` |
| CommandPalette | 🎨 | `cog` |
| CommandPalette | 🔗 | `github`/`linkedin` |
| CommandPalette | ↑ | `arrow-up` |
| CommandPalette | 🔍 | `search` |
| Blog | 📝 | `file` |
| Blog | 🗑️ | `times` |
| Blog | ❤️/🤍 | `heart` (solid/regular) |
| KeyboardHint | 💡 | `lightbulb` (light) |
| KeyboardHint | ✕ | `times` |
