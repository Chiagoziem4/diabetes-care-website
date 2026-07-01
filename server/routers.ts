import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { patients, doctors, users, appointments, healthMetrics, messages, notifications, medicationReminders, doctorPatients } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================================================
// PROTECTED PROCEDURE VARIANTS
// ============================================================================

const patientProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "patient") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Patient access required" });
  }
  return opts.next();
});

const doctorProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "doctor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Doctor access required" });
  }
  return opts.next();
});

const adminProcedure = protectedProcedure.use(async (opts) => {
  if (opts.ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return opts.next();
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,

  // ========================================================================
  // AUTH ROUTER
  // ========================================================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    register: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          role: z.enum(["patient", "doctor"]),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          diabetesType: z.enum(["type1", "type2", "gestational", "prediabetes", "other"]).optional(),
          specialization: z.string().optional(),
          licenseNumber: z.string().optional(),
          hospital: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const existingUser = await drizzleDb
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        try {
          const result = await drizzleDb.insert(users).values({
            openId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            role: input.role,
            isActive: true,
            isEmailVerified: false,
            name: `${input.firstName} ${input.lastName}`,
          });

          const userId = (result as any).insertId;

          if (input.role === "patient" && input.dateOfBirth && input.gender && input.diabetesType) {
            await drizzleDb.insert(patients).values({
              userId,
              dateOfBirth: new Date(input.dateOfBirth),
              gender: input.gender as "male" | "female" | "other",
              diabetesType: input.diabetesType as "type1" | "type2" | "gestational" | "prediabetes" | "other",
              targetBloodSugarMin: 70,
              targetBloodSugarMax: 140,
            });
          } else if (input.role === "doctor" && input.specialization && input.licenseNumber) {
            await drizzleDb.insert(doctors).values({
              userId,
              specialization: input.specialization,
              licenseNumber: input.licenseNumber,
              hospital: input.hospital,
              phone: input.phone,
              availability: {},
            });
          }

          return {
            success: true,
            message: "Registration successful. Please log in.",
            userId,
          };
        } catch (error) {
          console.error("Registration error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" });
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        try {
          const user = await drizzleDb
            .select()
            .from(users)
            .where(and(eq(users.email, input.email), eq(users.isActive, true)))
            .limit(1);

          if (user.length === 0) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
          }

          return {
            success: true,
            message: "Login successful",
            user: {
              id: user[0].id,
              email: user[0].email,
              role: user[0].role,
              firstName: user[0].firstName,
              lastName: user[0].lastName,
            },
          };
        } catch (error) {
          console.error("Login error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Login failed" });
        }
      }),
  }),

  // ========================================================================
  // PATIENT ROUTER
  // ========================================================================
  patient: router({
    profile: patientProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const patientProfile = await drizzleDb
        .select()
        .from(patients)
        .where(eq(patients.userId, ctx.user!.id))
        .limit(1);

      if (patientProfile.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Patient profile not found" });
      }

      return patientProfile[0];
    }),

    updateProfile: patientProcedure
      .input(
        z.object({
          dateOfBirth: z.string().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          address: z.string().optional(),
          targetBloodSugarMin: z.number().optional(),
          targetBloodSugarMax: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = {};
        if (input.dateOfBirth) updateData.dateOfBirth = new Date(input.dateOfBirth);
        if (input.gender) updateData.gender = input.gender;
        if (input.bloodType) updateData.bloodType = input.bloodType;
        if (input.height) updateData.height = input.height;
        if (input.weight) updateData.weight = input.weight;
        if (input.address) updateData.address = input.address;
        if (input.targetBloodSugarMin) updateData.targetBloodSugarMin = input.targetBloodSugarMin;
        if (input.targetBloodSugarMax) updateData.targetBloodSugarMax = input.targetBloodSugarMax;

        await drizzleDb
          .update(patients)
          .set(updateData)
          .where(eq(patients.userId, ctx.user!.id));

        return { success: true };
      }),
  }),

  // ========================================================================
  // DOCTOR ROUTER
  // ========================================================================
  doctor: router({
    profile: doctorProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const doctorProfile = await drizzleDb
        .select()
        .from(doctors)
        .where(eq(doctors.userId, ctx.user!.id))
        .limit(1);

      if (doctorProfile.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Doctor profile not found" });
      }

      return doctorProfile[0];
    }),

    updateProfile: doctorProcedure
      .input(
        z.object({
          specialization: z.string().optional(),
          hospital: z.string().optional(),
          bio: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = {};
        if (input.specialization) updateData.specialization = input.specialization;
        if (input.hospital) updateData.hospital = input.hospital;
        if (input.bio) updateData.bio = input.bio;
        if (input.phone) updateData.phone = input.phone;

        await drizzleDb
          .update(doctors)
          .set(updateData)
          .where(eq(doctors.userId, ctx.user!.id));

        return { success: true };
      }),

    availability: doctorProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const doctorProfile = await drizzleDb
        .select()
        .from(doctors)
        .where(eq(doctors.userId, ctx.user!.id))
        .limit(1);

      if (doctorProfile.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return doctorProfile[0].availability || {};
    }),

    updateAvailability: doctorProcedure
      .input(z.record(z.string(), z.array(z.object({ start: z.string(), end: z.string() }))))
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await drizzleDb
          .update(doctors)
          .set({ availability: input })
          .where(eq(doctors.userId, ctx.user!.id));

        return { success: true };
      }),

    patients: doctorProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const doctorProfile = await drizzleDb
        .select()
        .from(doctors)
        .where(eq(doctors.userId, ctx.user!.id))
        .limit(1);

      if (doctorProfile.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const doctorId = doctorProfile[0].id;

      const patientList = await drizzleDb
        .select()
        .from(doctorPatients)
        .where(eq(doctorPatients.doctorId, doctorId));

      return patientList;
    }),
  }),

  // ========================================================================
  // HEALTH METRICS ROUTER
  // ========================================================================
  healthMetrics: router({
    list: patientProcedure
      .input(z.object({ type: z.string().optional(), limit: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const patientProfile = await drizzleDb
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user!.id))
          .limit(1);

        if (patientProfile.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Patient profile not found" });
        }

        const patientId = patientProfile[0].id;

        let whereConditions = eq(healthMetrics.patientId, patientId);
        if (input.type) {
          whereConditions = and(whereConditions, eq(healthMetrics.type, input.type as any)) as any;
        }

        const metrics = await drizzleDb
          .select()
          .from(healthMetrics)
          .where(whereConditions)
          .orderBy(desc(healthMetrics.recordedAt))
          .limit(input.limit);
        return metrics;
      }),

    create: patientProcedure
      .input(
        z.object({
          type: z.enum(["blood_sugar", "blood_pressure", "weight", "exercise", "diet", "hba1c"]),
          bloodSugarValue: z.number().optional(),
          bloodSugarMeasurementTime: z.enum(["fasting", "before_meal", "after_meal", "bedtime", "random"]).optional(),
          bpSystolic: z.number().optional(),
          bpDiastolic: z.number().optional(),
          bpPulse: z.number().optional(),
          weightValue: z.number().optional(),
          exerciseActivityType: z.string().optional(),
          exerciseDurationMinutes: z.number().optional(),
          exerciseIntensity: z.enum(["low", "moderate", "high"]).optional(),
          dietMeal: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
          dietDescription: z.string().optional(),
          hba1cValue: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const patientProfile = await drizzleDb
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user!.id))
          .limit(1);

        if (patientProfile.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Patient profile not found" });
        }

        const patientId = patientProfile[0].id;

        const result = await drizzleDb.insert(healthMetrics).values({
          patientId,
          type: input.type,
          bloodSugarValue: input.bloodSugarValue,
          bloodSugarMeasurementTime: input.bloodSugarMeasurementTime,
          bpSystolic: input.bpSystolic,
          bpDiastolic: input.bpDiastolic,
          bpPulse: input.bpPulse,
          weightValue: input.weightValue as any,
          exerciseActivityType: input.exerciseActivityType,
          exerciseDurationMinutes: input.exerciseDurationMinutes,
          exerciseIntensity: input.exerciseIntensity,
          dietMeal: input.dietMeal,
          dietDescription: input.dietDescription,
          hba1cValue: input.hba1cValue as any,
          notes: input.notes,
        });

        return { success: true, id: (result as any).insertId };
      }),
  }),

  // ========================================================================
  // APPOINTMENTS ROUTER
  // ========================================================================
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (ctx.user!.role === "patient") {
        const patientProfile = await drizzleDb
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user!.id))
          .limit(1);

        if (patientProfile.length === 0) {
          return [];
        }

        const patientId = patientProfile[0].id;
        return await drizzleDb
          .select()
          .from(appointments)
          .where(eq(appointments.patientId, patientId))
          .orderBy(desc(appointments.scheduledDate));
      } else if (ctx.user!.role === "doctor") {
        const doctorProfile = await drizzleDb
          .select()
          .from(doctors)
          .where(eq(doctors.userId, ctx.user!.id))
          .limit(1);

        if (doctorProfile.length === 0) {
          return [];
        }

        const doctorId = doctorProfile[0].id;
        return await drizzleDb
          .select()
          .from(appointments)
          .where(eq(appointments.doctorId, doctorId))
          .orderBy(desc(appointments.scheduledDate));
      }

      return [];
    }),

    create: patientProcedure
      .input(
        z.object({
          doctorId: z.number(),
          scheduledDate: z.string(),
          type: z.enum(["in-person", "telemedicine", "phone"]),
          reason: z.string(),
          symptoms: z.string().optional(),
          duration: z.number().default(30),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const patientProfile = await drizzleDb
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user!.id))
          .limit(1);

        if (patientProfile.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Patient profile not found" });
        }

        const patientId = patientProfile[0].id;

        const result = await drizzleDb.insert(appointments).values({
          patientId,
          doctorId: input.doctorId,
          scheduledDate: new Date(input.scheduledDate),
          type: input.type,
          reason: input.reason,
          symptoms: input.symptoms,
          duration: input.duration,
          status: "pending",
        });

        return { success: true, id: (result as any).insertId };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          status: z.enum(["pending", "approved", "rejected", "cancelled", "completed", "rescheduled"]),
          doctorNotes: z.string().optional(),
          rejectionReason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = { status: input.status };
        if (input.doctorNotes) updateData.doctorNotes = input.doctorNotes;
        if (input.rejectionReason) updateData.rejectionReason = input.rejectionReason;

        await drizzleDb
          .update(appointments)
          .set(updateData)
          .where(eq(appointments.id, input.appointmentId));

        return { success: true };
      }),
  }),

  // ========================================================================
  // NOTIFICATIONS ROUTER
  // ========================================================================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await drizzleDb
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user!.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      return result;
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await drizzleDb
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));

        return { success: true };
      }),
  }),

  // ========================================================================
  // MEDICATION REMINDERS ROUTER
  // ========================================================================
  medications: router({
    list: patientProcedure.query(async ({ ctx }) => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const patientProfile = await drizzleDb
        .select()
        .from(patients)
        .where(eq(patients.userId, ctx.user!.id))
        .limit(1);

      if (patientProfile.length === 0) {
        return [];
      }

      return await drizzleDb
        .select()
        .from(medicationReminders)
        .where(eq(medicationReminders.patientId, patientProfile[0].id));
    }),

    create: patientProcedure
      .input(
        z.object({
          medicationName: z.string(),
          dosage: z.string(),
          frequency: z.enum(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "weekly", "as_needed"]),
          reminderTimes: z.array(z.string()),
          startDate: z.string(),
          endDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const patientProfile = await drizzleDb
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user!.id))
          .limit(1);

        if (patientProfile.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const result = await drizzleDb.insert(medicationReminders).values({
          patientId: patientProfile[0].id,
          medicationName: input.medicationName,
          dosage: input.dosage,
          frequency: input.frequency,
          reminderTimes: input.reminderTimes as any,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          notes: input.notes,
          isActive: true,
        });

        return { success: true, id: (result as any).insertId };
      }),

    update: patientProcedure
      .input(
        z.object({
          medicationId: z.number(),
          isActive: z.boolean().optional(),
          dosage: z.string().optional(),
          frequency: z.enum(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "weekly", "as_needed"]).optional(),
          reminderTimes: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = {};
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.dosage) updateData.dosage = input.dosage;
        if (input.frequency) updateData.frequency = input.frequency;
        if (input.reminderTimes) updateData.reminderTimes = input.reminderTimes;

        await drizzleDb
          .update(medicationReminders)
          .set(updateData)
          .where(eq(medicationReminders.id, input.medicationId));

        return { success: true };
      }),
  }),

  // ========================================================================
  // ADMIN ROUTER
  // ========================================================================
  admin: router({
    users: adminProcedure.query(async () => {
      const drizzleDb = await getDb();
      if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return await drizzleDb.select().from(users).limit(100);
    }),

    updateUserStatus: adminProcedure
      .input(z.object({ userId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        const drizzleDb = await getDb();
        if (!drizzleDb) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await drizzleDb
          .update(users)
          .set({ isActive: input.isActive })
          .where(eq(users.id, input.userId));

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
