# Leave Management System – MERN Stack

A full-featured Leave Management System built using **MongoDB, Express, React, and Node.js (MERN)**.  
The system supports employees, managers, and admin roles with real-world leave workflows such as applying for leave, approval cycles, leave balance tracking, policy management, and team hierarchy.

---

Demo Video:
https://drive.google.com/file/d/1X-dCZUeG7poWUckjBgqFJ9bqsqNCjvdF/view?usp=drive_link

---
## Project Overview

The application provides a complete workflow for managing employee leaves within an organization:

### Employee Features
- Apply for leave (Casual, Sick, Earned, etc.)
- View personal leave balances
- View leave history and status updates
- Cancel leave requests (if still pending)
- See manager details, department, employee ID

### HR Features
- System-wide visibility (all leaves, all employees)
- Approve/reject any leave request
- View department-wise leave patterns
- Access leave policies and employee profiles

### Admin Features
- Full access to all modules
- View and manage all users, managers, and HR
- View complete leave database
- System monitoring overview

---

## Authentication & Roles
The system uses:
- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected API routes
- Secure password hashing

Roles supported:
- **admin**
- **hr**
- **employee**

---

## Database Design (MongoDB + Mongoose)

The seed script creates:
- Leave Policies (Casual, Sick, Earned)
- Admin, HR, Managers (Engineering & Sales)
- 16 Employees (Engineering, Sales, HR)
- Sample approved, pending, and rejected leave applications
- Department hierarchy → employees → managers → HR → admin

This allows dashboards to show **realistic, meaningful data** (ideal for demo and evaluation).

---

## Test Login Credentials

### Admin

Email: admin@company.com
Password: Admin@123


### HR Manager


Email: hr@company.com
Password: Hr@123


### Managers


Engineering Manager: eng.manager@company.com
 / Manager@123
Sales Manager: sales.manager@company.com
 / Manager@123


### Employees


Engineering Employee 1: eng.employee1@company.com
 / Employee@123
Sales Employee 1: sales.employee1@company.com
 / Employee@123
HR Employee 1: hr.employee1@company.com
 / Employee@123


**All Employees** use:  

Password: Employee@123

---

## 📂 Folder Structure


/leave-management-system
│── backend/ # Node.js + Express API
│── frontend/ # React application
│── README.md # Main documentation
│── DECISIONS.md # Technical decision document

---

## ⚙️ Local Setup Instructions

### 1. Clone the repository

git clone https://github.com/ManojGowdaG15/leave-management-system.git

cd leave-management-system

### 2. Install backend dependencies

cd backend
npm install

### 3. Install frontend dependencies

cd ../frontend
npm install

---

## Running the Application Locally

### Start backend:

cd backend
npm run dev

### Start frontend:

cd frontend
npm run dev

---


##  Known Limitations
- Basic UI styling kept intentionally simple
- No calendar view

---

##  License
This project is created exclusively for the technical assignment for **DataSturdy Consulting**.
