# 🚇 KMRL Fleet Induction Decision Support System (DSS)

An AI-powered Decision Support System for **Kochi Metro Rail Limited (KMRL)** that automates fleet induction planning using Machine Learning, predictive maintenance, real-time operational data, branding constraints, and business rules.

---

## 🌐 Live Demo

### Frontend (Vercel)

https://kmrl-theta.vercel.app

### Backend API (Render)

https://kmrl-api.onrender.com

### Swagger Documentation

https://kmrl-api.onrender.com/docs

---

# 📖 Project Overview

The **KMRL Fleet Induction Decision Support System (DSS)** is an intelligent web application designed to assist metro depot controllers in selecting the most suitable trains for daily passenger service.

Instead of manually evaluating every train, the AI engine automatically analyzes operational parameters and recommends whether a train should be allocated for:

- ✅ Passenger Service
- 🟡 Standby
- 🔴 Maintenance

The system combines predictive analytics, operational rules, IoT alerts, branding commitments, maintenance schedules, and supervisor overrides to improve operational efficiency while ensuring safety and compliance.

---

# ✨ Features

## 🚇 Fleet Management

- AI-based Fleet Induction Planning
- Depot Layout Visualization
- Resource Utilization Dashboard
- Daily Operational Reports

## 🤖 Artificial Intelligence

- Predictive Maintenance Risk Analysis
- AI Decision Explainability
- AI Approval Workflow
- Human Override Support

## 📡 Smart Monitoring

- IoT Sensor Alert Monitoring
- Cleaning Management
- Branding Exposure Tracking
- Maintenance Scheduling

## 🔐 Security

- Role-Based Authentication
- Security Center
- Audit Logs
- User Activity Monitoring

## 📊 Analytics

- Fleet Health Dashboard
- Induction History
- KPI Monitoring
- Decision Breakdown

## 📂 Data Management

- CSV Upload
- Maximo Updates
- Supervisor Updates
- Cleaning Updates
- IoT Updates

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- Lucide Icons

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## AI / Machine Learning

- Scikit-Learn
- NumPy
- Joblib

## Deployment

- Vercel (Frontend)
- Render (Backend)

## Version Control

- Git
- GitHub

---

# 🏗️ System Architecture

```
                   React Frontend
                       │
                       │ REST API
                       ▼
                FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  SQLite Database   AI Engine    Business Rules
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              Fleet Induction Decision
```

---

# 📂 Project Structure

```
Kmrl
│
├── backend
│   ├── ai_models
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── induction.py
│   ├── simulation_engine.py
│   ├── ai_engine.py
│   ├── main.py
│   ├── requirements.txt
│   └── kmrl.db
│
├── frontend2
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── api
│   │   ├── assets
│   │   └── App.jsx
│   └── package.json
│
├── ml
│
└── README.md
```

---

# 🚀 Running the Project Locally

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/srihari18030606/Kmrl.git
cd Kmrl
```

---

## 2️⃣ Backend Setup

Open Terminal

```bash
cd backend
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

## 3️⃣ Frontend Setup

Open another terminal

```bash
cd frontend2
```

Install Dependencies

```bash
npm install
```

Run React

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 👤 Demo Login Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| Administrator | ADMIN001 | admin123 |
| Operations | OPS001 | ops123 |
| Maintenance | MAINT001 | maint123 |
| Cleaning | CLEAN001 | clean123 |
| Commercial | COMM001 | comm123 |

---

# 🤖 AI Decision Logic

The AI engine evaluates each train using:

- Fitness Certificate Status
- Predictive Maintenance Risk
- Maintenance Job Cards
- Cleaning Status
- IoT Sensor Alerts
- Branding Exposure
- Supervisor Overrides
- Mileage
- Maintenance Expiry
- Depot Constraints

Based on these parameters, the AI classifies trains into:

- Service
- Standby
- Maintenance

---

# 👥 User Roles

### Administrator

- Complete System Access
- Security Center
- User Management
- AI Approval Monitoring
- Audit Logs

---

### Operations

- Fleet Induction
- Depot Layout
- Resource Utilization
- AI Approvals
- Decision Explainability

---

### Maintenance

- Fleet Health
- Maintenance Dashboard
- Predictive Maintenance
- Alerts

---

### Cleaning

- Cleaning Management
- Cleaning Updates

---

### Commercial

- Branding Dashboard
- CSV Upload
- Contract Monitoring

---

# 📷 Application Screenshots

## Login Page

(Add Screenshot Here)

---

## Fleet Induction Dashboard

(Add Screenshot Here)

---

## Depot Layout

(Add Screenshot Here)

---

## AI Approval Dashboard

(Add Screenshot Here)

---

## Security Center

(Add Screenshot Here)

---

# 🔒 Security Features

- Role-Based Access Control
- Authentication Logging
- Security Event Monitoring
- User Activity Tracking
- AI Approval Auditing

---

# 📈 Future Enhancements

- Real-time MQTT IoT Integration
- Live GPS Train Tracking
- Multi Depot Support
- Mobile Application
- Predictive Delay Analysis
- Cloud Database (PostgreSQL)
- Notification System
- AI Chat Assistant
- Digital Twin Visualization

---

# 🌐 Deployment

## Frontend

Hosted on

**Vercel**

---

## Backend

Hosted on

**Render**

---

## Database

SQLite

---

# 📜 License

This project has been developed for educational and research purposes as part of a Final Year Engineering Project.

---

# 👨‍💻 Author

**Srihari**

B.Tech – Internet of Things (IoT)

Final Year Engineering Student

---

# ⭐ Acknowledgements

- Kochi Metro Rail Limited (KMRL)
- FastAPI
- React
- SQLAlchemy
- Scikit-Learn
- Vercel
- Render
- GitHub

---

## ⭐ If you found this project useful, don't forget to star the repository!