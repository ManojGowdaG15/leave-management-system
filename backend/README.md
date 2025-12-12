# Backend – Leave Management System (Node.js + Express)

The backend is built using **Express.js**, **MongoDB Atlas**, and **Mongoose**.  
It handles authentication, leave workflow, user hierarchy, leave policies, and data seeding.

---

##  Key Features
- JWT authentication + password hashing
- Role-based route protection
- Leave apply, approve, reject, cancel
- Department → Manager → Employee mapping
- Leave Balance auto-update
- Pre-seeded realistic organization dataset
- Leave policy management

---

##  Folder Structure

backend/
│── controllers/
│── models/
│── routes/
│── middlewares/
│── config/
│── seed/
│── server.js
│── package.json
│── .env (not included)


---
##  Seeding Data

Run seeder from backend folder:


node seed/seedData.js


Seeder creates:
- Admin, HR, 2 Managers
- 16 employees across departments
- Leave policies
- Pending, approved & rejected leave samples
- Balanced leave stats

---

##  Environment Variables

Create a `.env` file:



PORT=5000
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173


---

##  Installation
Install dependencies:


npm install


---

##  Run Backend

### Development:


npm run dev


### Production:


npm start


---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |

### Employee APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leaves/apply` | Apply for leave |
| GET | `/api/leaves/mine` | View my leave history |
| DELETE | `/api/leaves/cancel/:id` | Cancel pending leave |

### Manager APIs
| Method | Endpoint |
|--------|----------|
| GET | `/api/leaves/pending` |
| PUT | `/api/leaves/approve/:id` |
| PUT | `/api/leaves/reject/:id` |

### HR/Admin APIs
- View all users
- View all leave applications
- View leave policies

---

