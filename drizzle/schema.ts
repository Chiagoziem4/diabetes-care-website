import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  firstName: varchar("firstName", { length: 50 }),
  lastName: varchar("lastName", { length: 50 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  avatar: varchar("avatar", { length: 500 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "patient", "doctor"]).default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isEmailVerified: boolean("isEmailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Patient profiles
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  dateOfBirth: timestamp("dateOfBirth").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  bloodType: mysqlEnum("bloodType", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  diabetesType: mysqlEnum("diabetesType", ["type1", "type2", "gestational", "prediabetes", "other"]).notNull(),
  diagnosisDate: timestamp("diagnosisDate"),
  height: int("height"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  address: text("address"),
  emergencyContact: json("emergencyContact"),
  allergies: json("allergies"),
  currentMedications: json("currentMedications"),
  targetBloodSugarMin: int("targetBloodSugarMin"),
  targetBloodSugarMax: int("targetBloodSugarMax"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Doctor profiles
 */
export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  licenseNumber: varchar("licenseNumber", { length: 100 }).notNull(),
  hospital: varchar("hospital", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  availability: json("availability"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * Doctor-Patient relationships
 */
export const doctorPatients = mysqlTable("doctor_patients", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  isPrimary: boolean("isPrimary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DoctorPatient = typeof doctorPatients.$inferSelect;
export type InsertDoctorPatient = typeof doctorPatients.$inferInsert;

/**
 * Health metrics tracking
 */
export const healthMetrics = mysqlTable("health_metrics", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  type: mysqlEnum("type", ["blood_sugar", "blood_pressure", "weight", "exercise", "diet", "hba1c"]).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  // Blood sugar fields
  bloodSugarValue: int("bloodSugarValue"),
  bloodSugarMeasurementTime: mysqlEnum("bloodSugarMeasurementTime", ["fasting", "before_meal", "after_meal", "bedtime", "random"]),
  bloodSugarUnit: mysqlEnum("bloodSugarUnit", ["mg/dL", "mmol/L"]).default("mg/dL"),
  // Blood pressure fields
  bpSystolic: int("bpSystolic"),
  bpDiastolic: int("bpDiastolic"),
  bpPulse: int("bpPulse"),
  // Weight fields
  weightValue: decimal("weightValue", { precision: 5, scale: 2 }),
  weightBmi: decimal("weightBmi", { precision: 4, scale: 1 }),
  // Exercise fields
  exerciseActivityType: varchar("exerciseActivityType", { length: 100 }),
  exerciseDurationMinutes: int("exerciseDurationMinutes"),
  exerciseCaloriesBurned: int("exerciseCaloriesBurned"),
  exerciseIntensity: mysqlEnum("exerciseIntensity", ["low", "moderate", "high"]),
  // Diet fields
  dietMeal: mysqlEnum("dietMeal", ["breakfast", "lunch", "dinner", "snack"]),
  dietDescription: text("dietDescription"),
  dietCarbohydrates: int("dietCarbohydrates"),
  dietCalories: int("dietCalories"),
  // HbA1c fields
  hba1cValue: decimal("hba1cValue", { precision: 4, scale: 1 }),
  // General
  notes: text("notes"),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;

/**
 * Appointments
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  duration: int("duration").default(30),
  type: mysqlEnum("type", ["in-person", "telemedicine", "phone"]).default("in-person"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled", "completed", "rescheduled"]).default("pending"),
  reason: text("reason").notNull(),
  symptoms: text("symptoms"),
  notes: text("notes"),
  doctorNotes: text("doctorNotes"),
  meetingLink: varchar("meetingLink", { length: 500 }),
  rejectionReason: text("rejectionReason"),
  rescheduledFromId: int("rescheduledFromId"),
  reminderSent: boolean("reminderSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Messages between patients and doctors
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("conversationId", { length: 100 }).notNull(),
  senderId: int("senderId").notNull(),
  senderRole: mysqlEnum("senderRole", ["patient", "doctor"]).notNull(),
  recipientId: int("recipientId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  attachments: json("attachments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["appointment_reminder", "appointment_update", "medication_reminder", "health_alert", "message", "system"]).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  actionUrl: varchar("actionUrl", { length: 500 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Medication reminders
 */
export const medicationReminders = mysqlTable("medication_reminders", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  medicationName: varchar("medicationName", { length: 100 }).notNull(),
  dosage: varchar("dosage", { length: 50 }).notNull(),
  frequency: mysqlEnum("frequency", ["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "weekly", "as_needed"]).notNull(),
  reminderTimes: json("reminderTimes"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicationReminder = typeof medicationReminders.$inferSelect;
export type InsertMedicationReminder = typeof medicationReminders.$inferInsert;
