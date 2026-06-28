# ContactHub — Full-Stack Contact Manager

A full-stack app with **Express + MySQL backend** and **React frontend**.  
Every contact is identified by a **UUID** shown prominently on the detail page.

---

## Project Structure

```
contact-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL pool + auto-create tables
│   │   ├── middleware/auth.js    # JWT auth middleware
│   │   ├── controllers/
│   │   │   ├── authController.js  # register / login / me
│   │   │   └── contactController.js # CRUD with UUID
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── contacts.js
│   │   └── index.js              # Express app entry
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/api.js            # Axios + JWT interceptor
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Contacts.js       # List + search + create modal
    │   │   └── ContactDetail.js  # Full info + UUID + edit/delete
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## Setup

### 1. MySQL

```sql
CREATE DATABASE contact_manager;
```

Tables are **auto-created** on first server start.

### 2. Backend

```bash
cd backend
# Edit .env with your DB credentials
npm install
npm run dev       # port 5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start         # port 3000 (proxies /api → localhost:5000)
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | ✓ | Get current user |

### Contacts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/contacts | ✓ | List all contacts |
| GET | /api/contacts/:id | ✓ | Get contact by UUID |
| POST | /api/contacts | ✓ | Create contact (UUID auto-generated) |
| PUT | /api/contacts/:id | ✓ | Update contact by UUID |
| DELETE | /api/contacts/:id | ✓ | Delete contact by UUID |

---

## Contact Detail — UUID Features

- **UUID badge** displayed under the contact name — click to copy to clipboard
- **UUID shown in card list** at the bottom of each contact card
- **Record details section** in the detail view shows full UUID + created/updated timestamps
- **Edit modal** shows the UUID as a read-only reference
