# Build and Deploy to GitHub Pages

## Quick Deploy Commands

```bash
# 1. Перейти в директорию frontend
cd metalreact-backend/services/monitor-v2/frontend

# 2. Установить gh-pages если еще не установлен
npm install --save-dev gh-pages

# 3. Build проекта
npm run build

# 4. Commit изменений в git (если есть)
git add .
git commit -m "feat: Admin Panel V2 - Complete implementation with all features"

# 5. Push в main branch
git push origin main

# 6. Deploy на GitHub Pages
npm run deploy
```

## Автоматический деплой (одна команда)

```bash
cd metalreact-backend/services/monitor-v2/frontend && npm run deploy
```

## После деплоя

Админка будет доступна по адресу:
```
https://<your-github-username>.github.io/MetalReact_V2/
```

## Настройка GitHub Pages

1. Зайти в Settings → Pages вашего репозитория
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Folder: / (root)
5. Save

## Обновление API URL

Если нужно изменить API URL для production:

1. Отредактировать `.env`:
```bash
VITE_API_BASE_URL=https://api.nikamet.pro/monitor
```

2. Rebuild и redeploy:
```bash
npm run build
npm run deploy
```

## Troubleshooting

### Проблема: 404 на GitHub Pages

Проверить что:
- В `vite.config.ts` установлен правильный `base: '/MetalReact_V2/'`
- gh-pages branch создан
- В Settings → Pages выбран gh-pages branch

### Проблема: CORS ошибки

Проверить что backend (api.nikamet.pro) разрешает CORS для домена GitHub Pages.

В `main.py` добавить:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # или конкретный домен
        "https://<username>.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Production Checklist

- [ ] Build проходит без ошибок
- [ ] API URL правильный в .env
- [ ] Git изменения закоммичены
- [ ] Deploy на GitHub Pages выполнен
- [ ] Страница открывается в браузере
- [ ] API запросы работают (проверить в Console)
- [ ] Авторизация работает
- [ ] Все таблицы загружаются

