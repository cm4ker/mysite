# Button Component

Универсальный компонент кнопки для использования во всем приложении.

## Импорт

```tsx
import Button from '../button/Button';
// или
import Button from '@/components/button';
```

## Основное использование

### Primary кнопка (основное действие)

```tsx
<Button variant="primary" onClick={handleClick}>
  Кликни меня
</Button>
```

### Secondary кнопка (второстепенное действие)

```tsx
<Button variant="secondary" onClick={handleClick}>
  Отмена
</Button>
```

## С иконкой

```tsx
<Button 
  variant="primary"
  icon={['fas', 'pen']}
  onClick={handleClick}
>
  Новая запись
</Button>
```

## С горячей клавишей

```tsx
<Button 
  variant="primary"
  onClick={handleClick}
  kbd="N"
>
  Новая запись
</Button>
```

## Как ссылка

```tsx
<Button 
  variant="secondary"
  href="#section"
  onClick={() => scrollToSection('section')}
  kbd="S"
>
  Перейти к секции
</Button>
```

## Disabled состояние

```tsx
<Button 
  variant="primary"
  onClick={handleClick}
  disabled={true}
>
  Недоступно
</Button>
```

## Полный пример

```tsx
<Button 
  variant="primary"
  icon={['fas', 'rocket']}
  onClick={handleLaunch}
  kbd="L"
  disabled={!isReady}
>
  Запустить
</Button>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Вариант стиля кнопки |
| `children` | `React.ReactNode` | - | Текст кнопки (обязательно) |
| `onClick` | `() => void` | - | Обработчик клика |
| `href` | `string` | - | URL для ссылки (рендерит `<a>`) |
| `icon` | `[IconPrefix, IconName]` | - | Font Awesome иконка |
| `kbd` | `string` | - | Горячая клавиша для отображения |
| `disabled` | `boolean` | `false` | Отключить кнопку |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Тип кнопки (только для `<button>`) |
| `className` | `string` | - | Дополнительные CSS классы |

## Стили

Компонент использует единый стиль для всех кнопок в приложении:

- Шрифт: Excalifont
- Размер: 13px
- Padding: 6px 14px
- Border radius: 3px
- Transition: 0.2s для всех свойств
- Hover эффект: translateY(-2px) для primary, translateY(-1px) для secondary

### Primary кнопка
- Фон: `var(--accent)` (синий)
- Цвет текста: белый
- Hover: поднимается вверх с тенью

### Secondary кнопка
- Фон: полупрозрачный
- Цвет текста: `var(--text)`
- Border: `var(--border)`
- Hover: акцентная рамка

## Примеры использования в проекте

### Hero секция
```tsx
<Button variant="primary" href="#blog" onClick={() => scrollToSection('blog')} kbd="B">
  Смотреть блог
</Button>

<Button variant="secondary" href="#contact" onClick={() => scrollToSection('contact')} kbd="C">
  Связаться
</Button>
```

### Blog
```tsx
<Button variant="primary" icon={['fas', 'pen']} onClick={() => setComposerOpen(true)} kbd="N">
  Новая запись
</Button>

<Button variant="secondary" icon={['fas', 'times']} onClick={handleCancel}>
  Отмена
</Button>

<Button variant="primary" icon={['fas', 'check']} onClick={handlePublish}>
  Опубликовать
</Button>
```

## Accessibility

- Кнопка поддерживает состояние `disabled`
- Используйте `kbd` для отображения горячих клавиш
- Иконки от Font Awesome имеют встроенную поддержку ARIA
- При использовании как ссылка (`href`) рендерится `<a>` для лучшей семантики
