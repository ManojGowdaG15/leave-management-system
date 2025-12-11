# Leave Management System

A comprehensive web-based Leave Management System built with React, Node.js, and MongoDB.

## Features

### For Employees
- Apply for leave with date picker and leave type selection
- View leave application history and status
- Check available leave balance (Casual, Sick, Earned)
- Cancel pending leave applications
- Dashboard with leave statistics

### For Managers
- View team leave requests (pending approvals)
- Approve or reject leave applications with comments
- View team leave calendar
- Team overview and analytics
- Manage team members

### Common Features
- User authentication with JWT
- Role-based access control (Employee/Manager)
- Mobile responsive design
- Modern and intuitive UI/UX
- Real-time updates

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS for styling
- React Hot Toast for notifications
- Framer Motion for animations
- React Datepicker for date selection
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-async-handler for error handling

### Database
- MongoDB Atlas (Cloud) or local MongoDB

## Prerequisites

- Node.js 16+ installed
- MongoDB instance (local or Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd leave-management-system