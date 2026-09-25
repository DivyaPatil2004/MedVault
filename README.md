<div align="center">

# 🏥 MedVault — Hospital Management System

**Backend-focused hospital management system with concurrency-safe appointment booking, JWT authentication, and role-based access control**

[![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📖 Overview

**MedVault** is a fullstack hospital management system covering patients, doctors,
appointments, availability, and clinical notes. It goes beyond basic CRUD by tackling
real backend engineering challenges — concurrency-safe appointment booking with
pessimistic locking, transaction propagation control, and JWT-secured role-based access
for patients, doctors, and admins.

---

## ✨ Features

- 🔐 **JWT Authentication & Role-Based Access** — separate roles for patients, doctors, and admins
- 📅 **Appointment Booking & Cancellation** — full lifecycle with confirmation and rollback handling
- 🔒 **Concurrency-Safe Slot Booking** — pessimistic locking (`SELECT … FOR UPDATE`) prevents double-booking under concurrent requests
- 📝 **Clinical Notes** — doctors can add notes to confirmed appointments; patients can view their full history
- ✅ **Validation** — Bean Validation with `@Valid`, `@Future`, and a custom `@ValidSlotTimeRange` validator
- 📘 **API Documentation** — interactive Swagger UI via `springdoc-openapi`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java, Spring Boot 4, Spring Data JPA |
| **Security** | Spring Security (JWT), role-based access |
| **Validation** | Bean Validation, custom validators |
| **Database** | PostgreSQL |
| **Concurrency** | Pessimistic locking (`SELECT … FOR UPDATE`) |
| **API Docs** | Swagger UI (`springdoc-openapi`) |
| **Frontend** | React + Vite |
| **Infrastructure** | Docker |

---

## 🔄 Demo Flow

1. Sign in as admin and create a doctor (email + password).
2. Sign in as that doctor and publish a future availability slot.
3. Register as a patient, pick the doctor, and book the slot.
4. As the doctor, add a clinical note on the confirmed appointment.
5. As the patient, open **My history & clinical notes**.

---

## 🧠 Learning Goals Covered

- `@Transactional(propagation = REQUIRED)` on book/cancel, with rollback on exceptions
- `@Transactional(propagation = REQUIRES_NEW)` when saving clinical notes
- `@Valid`, `@Future`, and a custom `@ValidSlotTimeRange` validator
- Pessimistic locking in `AppointmentSlotRepository.findByIdForUpdate` to avoid double-booking
- JWT + role-based access for patients, doctors, and admins

---

## 📡 API Reference

| Action | Method | Path |
|---|---|---|
| Register / Login | POST | `/api/auth/register`, `/api/auth/login` |
| Doctor Availability | GET | `/api/slots/available?doctorId=` |
| Book Appointment | POST | `/api/appointments/book` |
| Cancel Appointment | POST | `/api/appointments/{id}/cancel` |
| Patient History | GET | `/api/patients/{id}/history` |
| Clinical Notes | POST | `/api/patients/notes` |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven (or use the included `./mvnw` wrapper)

### 1. Database
```bash
docker compose up -d
```

### 2. Backend
From the project root (IntelliJ: run `MedVaultApplication`, or via Maven):
```bash
./mvnw spring-boot:run
```
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

**Seeded admin (local/demo only):**
- Email: `admin@medvault.com`
- Password: `Admin@123`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
UI: http://localhost:5173

> ⚠️ The seeded admin credentials are for local development/demo purposes only. Replace or remove this seed data before any real deployment.

---

## 📌 Project Status

🚧 Actively in development — backend (auth, booking, concurrency, notes) is functional; frontend and additional features are in progress.

---

## 📬 Contact

Built by **Divya Patil**
[GitHub](https://github.com/DivyaPatil2004) · [LinkedIn](https://www.linkedin.com/in/divyapatil39) · divyapatil.rc@gmail.com
