# Мини-приложение без сервера: GitHub Pages

Это простое статическое веб‑приложение (HTML/CSS/JS) с динамическим JavaScript: цитаты берутся из публичного API, при недоступности — показывается локальный запасной вариант. Его можно открыть напрямую с GitHub Pages, без собственного сервера.

## Как запустить локально

Откройте файл `index.html` двойным кликом. Для загрузки цитат требуется интернет; при проблемах с сетью/блокировках CORS будет показан локальный fallback.

## Как опубликовать на GitHub Pages

1. Создайте публичный репозиторий на GitHub и запушьте этот код:
   ```bash
   git add .
   git commit -m "Add minimal static web app for GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git push -u origin main
   ```
2. В репозитории откройте Settings → Pages.
3. В разделе Build and deployment → Source выберите "Deploy from a branch".
4. В поле Branch укажите `main` и `/ (root)` (корень), нажмите Save.
5. Подождите 1–2 минуты. Готовый сайт будет доступен по адресу вида:
   `https://<USERNAME>.github.io/<REPO>/`

### Заметки

- Цитаты запрашиваются с `https://api.quotable.io/random` (CORS включён). Если запрос не пройдёт (например, сработает ограничение сети), будет показана случайная цитата из локального списка.
- Дополнительный сервер не нужен: всё — статические файлы, которые обслуживаются GitHub Pages.


