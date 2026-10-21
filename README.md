# EPlatform — система управління навчанням

Вебзастосунок для навчання, курсів і оцінювання. Студенти проходять курси, здають завдання й тести; викладачі створюють навчальні матеріали та оцінюють роботи; адміністратори керують користувачами.

## Технології

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios.
- **Backend:** Node.js, Express 5, PostgreSQL (`pg`), JWT, Multer.
- **Файли:** локально на диску під час розробки; Cloudinary можна підключити для розгортання.

## Локальний запуск у Windows і VS Code

Потрібні Node.js 20.19+ (або 22.12+) і PostgreSQL. Старі облікові дані не потрібні: ця інструкція створює порожню локальну базу. Під час реєстрації можна вибрати роль викладача та створити тестовий курс.

### 1. Відкрити проєкт

Клонуйте репозиторій, якщо його ще немає на комп’ютері, а потім відкрийте кореневу папку проєкту у VS Code:

```powershell
git clone https://github.com/los-stack/edu-system.git
cd edu-system
code .
```

Якщо репозиторій уже є, відкрийте його через **File → Open Folder**. Важливо відкрити корінь `edu-system`, а не окремо папку `frontend` чи `backend`.

### 2. Встановити PostgreSQL і створити базу

Встановіть PostgreSQL 17 для Windows, наприклад командою:

```powershell
winget install --id PostgreSQL.PostgreSQL.17 --exact
```

Якщо команда недоступна, завантажте інсталятор із [офіційної сторінки PostgreSQL для Windows](https://www.postgresql.org/download/windows/). Під час встановлення задайте пароль користувача `postgres` і запам’ятайте його. Потім у pgAdmin створіть порожню базу `edu_system` (**Databases → Create → Database**).

У pgAdmin відкрийте **Query Tool** для бази `edu_system`, відкрийте файл `backend/database/schema.sql` і виконайте його. SQL-файл створить таблиці, які потрібні застосунку.

### 3. Створити локальні файли налаштувань

У терміналі VS Code, відкритому в корені репозиторію, виконайте:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Відредагуйте `backend/.env`: замініть `CHANGE_ME` у `DATABASE_URL` на пароль, який задали під час встановлення PostgreSQL. Якщо пароль містить символи на кшталт `@` або `#`, закодуйте їх для URL. `JWT_SECRET` у прикладі підходить лише для локальної розробки. Файли `.env` ігноруються Git — не додавайте в них справжні ключі до комітів.

### 4. Запустити сервери

Відкрийте два термінали у VS Code.

У першому:

```powershell
cd backend
npm install
npm run dev
```

У другому:

```powershell
cd frontend
npm install
npm run dev
```

Відкрийте адресу, яку покаже Vite (зазвичай `http://localhost:5173`). Створіть обліковий запис на сторінці реєстрації та увійдіть. Зупинити кожен сервер можна комбінацією `Ctrl+C` у відповідному терміналі.

Файли, завантажені під час локальної розробки, зберігаються в `backend/uploads`. Cloudinary для цього не потрібен. Для production-завантажень налаштуйте Cloudinary окремо; локальні налаштування не переносіть у production.

## Git і коміти

Перегляньте зміни у вкладці **Source Control** у VS Code або командами:

```powershell
git status
git diff
```

Коли зміни готові, створіть коміт і надішліть свою гілку на GitHub:

```powershell
git add .
git commit -m "Describe your change"
git push -u origin HEAD
```

Коміт зберігає знімок змін у Git; `push` надсилає його на GitHub. Перед комітом перевіряйте, що `.env`, паролі й інші секрети не потрапили до списку файлів.

## Перевірки

Для фронтенду:

```powershell
cd frontend
npm run lint
npm run build
```

У бекенді поки немає автоматизованого набору тестів. `npm test` ще не реалізований.

## Розгортання

Frontend можна розгорнути на Vercel, backend — на Render. У середовищі розгортання задайте production `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` і облікові дані Cloudinary. Для production збережіть HTTPS, `HttpOnly` cookies та дозволений CORS-origin. Не використовуйте локальну БД або секрет із `.env.example` у production.

## Ліцензія

MIT
