# MarkDBible — Agent Instructions

Knowledge-base app with Markdown notes. Two independent sub-projects: `backend/` (Django REST) and `frontend/` (React + Vite). No root-level build tool.

---

## Setup

### Backend
```bash
# 1. Copy env and fill in credentials
cp backend/.env.example backend/.env

# 2. Start Postgres (only the DB is containerised — Django runs locally)
cd backend && docker-compose up -d

# 3. Activate venv, install deps, migrate, run
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

### Frontend
```bash
# Needs VITE_API_URL pointing at the running Django server
cp frontend/.env.example frontend/.env   # VITE_API_URL=http://127.0.0.1:8000/api/

cd frontend && npm install && npm run dev
```

---

## Developer Commands

### Backend (run from `backend/`)
| Task | Command |
|---|---|
| Run all tests | `pytest` |
| Run with coverage | `pytest --cov=notes` |
| Single test | `pytest notes/tests/test_api.py::TestNoteAPI::test_user_sees_only_own_notes` |
| Make migrations | `python manage.py makemigrations` |
| Apply migrations | `python manage.py migrate` |

`pytest.ini` sets `--nomigrations` and `DJANGO_SETTINGS_MODULE=config.settings` — no extra flags needed.

### Frontend (run from `frontend/`)
| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` |

---

## Architecture

### Backend
- **Django project package:** `config/` (settings, urls, wsgi/asgi) — not an app
- **Only one Django app:** `notes/` — contains all models, views, serializers, URLs, tests
- **Auth:** `rest_framework_simplejwt` — endpoints at `api/token/` (obtain) and `api/token/refresh` (refresh). Default permission is `IsAuthenticated` globally.
- **Media files:** served only when `DEBUG=True` via `config/urls.py`; uploaded images go to `backend/media/note_images/`
- **All settings come from `.env`** via `python-dotenv` — the app will not start without it

#### Key models (`notes/models.py`)
- `Folder` — hierarchical (self-FK `parent`), unique per `(user, name, parent)`
- `Tag` — unique per `(user, name)`
- `Note` — unique per `(user, title)`; has M2M `links` (self, asymmetric), M2M `tags`, M2M `shared_with`
- `ImageAttachment` — stores uploaded images linked to a user

#### Auto-linking signal
A `post_save` signal on `Note` automatically:
- Parses `[[wikilinks]]` in `content` → sets `note.links`
- Parses `#hashtags` in `content` → creates/sets `note.tags`

**Do not manually set `links` or `tags` in tests** — save the note with the right `content` and the signal handles it.

#### API routes (all under `/api/`)
- `notes/` — `NoteViewSet` (CRUD + custom actions)
- `folders/` — `FolderViewSet`
- `images/` — `ImageAttachmentViewSet`
- `register/` — `RegisterView` (public)
- `shared/<uuid:public_id>/` — `PublicNoteView` (public)
- `token/` — JWT obtain
- `token/refresh` — JWT refresh

### Frontend
- **JavaScript only — no TypeScript.** All files are `.js` / `.jsx`
- **Single API module:** `src/api.js` — axios instance with base URL from `import.meta.env.VITE_API_URL`
- **Auth flow:** access token stored in `localStorage` key `access`. Request interceptor in `api.js` reads it, checks expiry with `jwt-decode`, attaches `Authorization: Bearer` header. **No refresh token logic yet** — expired token triggers `localStorage.removeItem('access')` + redirect to `/login`
- **No AuthContext** — auth state is read directly from `localStorage` in `ProtectedRoute` and pages
- **Settings** (theme + language) live in `SettingsContext`, persisted to `localStorage`

#### Routes
| Path | Component | Auth |
|---|---|---|
| `/` | `Home` | Protected |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/shared/:publicId` | `SharedNote` | Public |
| `*` | redirect to `/login` | — |

---

## Testing Conventions

- Tests use `pytest-django` with `factory_boy` fixtures (`notes/tests/factories.py`)
- Use `@pytest.mark.django_db` on test classes/functions
- Use `APIClient.force_authenticate(user=...)` — do not generate real JWT tokens in tests
- `--nomigrations` is always active; use factories, not fixtures/SQL dumps
