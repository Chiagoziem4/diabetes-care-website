# DiabetesCare — Smart Diabetes & Chronic Health Management Platform

DiabetesCare is a comprehensive, production-ready full-stack web application designed to empower patients, doctors, and administrators with intelligent tools for diabetes and chronic health management.

## 🌐 Live Website

- **Live Preview / Production URL:** [https://diabcare-g5ekittx.manus.space](https://diabcare-g5ekittx.manus.space)

---

## ✨ Key Features

### 1. Role-Based Authentication & Access Control
- **Patients:** Access personalized health dashboards, log health metrics, book appointments, manage medications, and consult AI insights.
- **Doctors:** Review assigned patient lists, examine health metrics and blood sugar trends, add clinical notes, and manage availability.
- **Admins:** Oversee platform users, activate or deactivate accounts, and monitor system activity.

### 2. Patient Health Tracking Dashboard
- **Stat Cards:** Real-time summary cards covering blood sugar averages, upcoming appointments, active medications, and overall health scores.
- **Interactive Charts:** 7-day blood sugar trend visualization powered by Recharts.
- **Comprehensive Logging:** Track blood sugar (fasting, pre/post meal, bedtime, random), blood pressure (systolic, diastolic, pulse), weight, exercise (type, duration, intensity), diet (meal type, descriptions), and HbA1c levels.

### 3. Appointment Booking & Management
- Patients can book in-person or telemedicine appointments with healthcare specialists.
- Doctors can review, approve, reject, or reschedule appointments with integrated clinical notes.

### 4. Medication Reminders & In-App Notifications
- Full CRUD management for medication schedules, dosages, frequencies, and active/inactive toggles.
- Real-time notification system delivering appointment alerts, health warnings, and system updates.

### 5. Secure Messaging & AI Health Assistant
- Secure communication channels between patients and doctors.
- AI-powered health assistant delivering blood sugar analysis and lifestyle recommendations.

---

## 🛠 Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui components, Recharts, Wouter
- **Backend:** Node.js, Express, tRPC 11, TypeScript
- **Database & ORM:** MySQL / TiDB with Drizzle ORM
- **Deployment:** Autoscale cloud hosting with custom domain support

---

## 🚀 Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Chiagoziem4/diabetes-care-website.git
   cd diabetes-care
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (`DATABASE_URL`, JWT secrets, etc.).

4. Start the development server:
   ```bash
   pnpm dev
   ```
