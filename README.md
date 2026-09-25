# MedVault — Hospital Management System

Beginner fullstack project: patients, doctors, appointments, availability, and clinical notes.

## Stack

- Backend: Spring Boot 4, Spring Data JPA, Spring Security (JWT), Bean Validation, PostgreSQL
- API docs: Swagger UI (`springdoc-openapi`)
- Frontend: React + Vite
- Concurrency: pessimistic locking on appointment slots (`SELECT … FOR UPDATE`)

## Run locally

### 1. Database

```bash
docker compose up -d
```

### 2. Backend

From the project root (IntelliJ: run `MedVaultApplication`, or Maven):

```bash
./mvnw spring-boot:run
```

API: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html

Seeded admin:

- Email: `admin@medvault.com`
- Password: `Admin@123`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

## Demo flow

1. Sign in as admin and create a doctor (email + password).
2. Sign in as that doctor and publish a future availability slot.
3. Register as a patient, pick the doctor, and book the slot.
4. As the doctor, add a clinical note on the confirmed appointment.
5. As the patient, open **My history & clinical notes**.

## Learning goals covered

- `@Transactional(propagation = REQUIRED)` on book/cancel, with rollback on exceptions
- `@Transactional(propagation = REQUIRES_NEW)` when saving clinical notes
- `@Valid`, `@Future`, and a custom `@ValidSlotTimeRange` validator
- Pessimistic locking in `AppointmentSlotRepository.findByIdForUpdate` to avoid double-booking
- JWT + role-based access for patients, doctors, and admins

## Useful APIs

| Action | Method | Path |
| --- | --- | --- |
| Register / login | POST | `/api/auth/register`, `/api/auth/login` |
| Doctor availability | GET | `/api/slots/available?doctorId=` |
| Book | POST | `/api/appointments/book` |
| Cancel | POST | `/api/appointments/{id}/cancel` |
| Patient history | GET | `/api/patients/{id}/history` |
| Clinical notes | POST | `/api/patients/notes` |
