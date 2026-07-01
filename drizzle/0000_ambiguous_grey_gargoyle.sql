CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`type` enum('in-person','telemedicine','phone') DEFAULT 'in-person',
	`status` enum('pending','approved','rejected','cancelled','completed','rescheduled') DEFAULT 'pending',
	`reason` text NOT NULL,
	`symptoms` text,
	`notes` text,
	`doctorNotes` text,
	`meetingLink` varchar(500),
	`rejectionReason` text,
	`rescheduledFromId` int,
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctor_patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`isPrimary` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doctor_patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`specialization` varchar(100) NOT NULL,
	`licenseNumber` varchar(100) NOT NULL,
	`hospital` varchar(200),
	`phone` varchar(20),
	`bio` text,
	`availability` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `health_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`type` enum('blood_sugar','blood_pressure','weight','exercise','diet','hba1c') NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`bloodSugarValue` int,
	`bloodSugarMeasurementTime` enum('fasting','before_meal','after_meal','bedtime','random'),
	`bloodSugarUnit` enum('mg/dL','mmol/L') DEFAULT 'mg/dL',
	`bpSystolic` int,
	`bpDiastolic` int,
	`bpPulse` int,
	`weightValue` decimal(5,2),
	`weightBmi` decimal(4,1),
	`exerciseActivityType` varchar(100),
	`exerciseDurationMinutes` int,
	`exerciseCaloriesBurned` int,
	`exerciseIntensity` enum('low','moderate','high'),
	`dietMeal` enum('breakfast','lunch','dinner','snack'),
	`dietDescription` text,
	`dietCarbohydrates` int,
	`dietCalories` int,
	`hba1cValue` decimal(4,1),
	`notes` text,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medication_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`medicationName` varchar(100) NOT NULL,
	`dosage` varchar(50) NOT NULL,
	`frequency` enum('once_daily','twice_daily','three_times_daily','four_times_daily','weekly','as_needed') NOT NULL,
	`reminderTimes` json,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medication_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` varchar(100) NOT NULL,
	`senderId` int NOT NULL,
	`senderRole` enum('patient','doctor') NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`attachments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('appointment_reminder','appointment_update','medication_reminder','health_alert','message','system') NOT NULL,
	`title` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(500),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dateOfBirth` timestamp NOT NULL,
	`gender` enum('male','female','other') NOT NULL,
	`bloodType` enum('A+','A-','B+','B-','AB+','AB-','O+','O-'),
	`diabetesType` enum('type1','type2','gestational','prediabetes','other') NOT NULL,
	`diagnosisDate` timestamp,
	`height` int,
	`weight` decimal(5,2),
	`address` text,
	`emergencyContact` json,
	`allergies` json,
	`currentMedications` json,
	`targetBloodSugarMin` int,
	`targetBloodSugarMax` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`firstName` varchar(50),
	`lastName` varchar(50),
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`avatar` varchar(500),
	`loginMethod` varchar(64),
	`role` enum('user','admin','patient','doctor') NOT NULL DEFAULT 'user',
	`isActive` boolean NOT NULL DEFAULT true,
	`isEmailVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
