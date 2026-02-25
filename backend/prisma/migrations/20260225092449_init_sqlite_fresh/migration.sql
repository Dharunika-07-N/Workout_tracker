-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_login" DATETIME
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "height" REAL,
    "weight" REAL,
    "age" INTEGER,
    "gender" TEXT,
    "target_weight" REAL,
    "profile_picture_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT
);

-- CreateTable
CREATE TABLE "UserEquipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserEquipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment_required" TEXT NOT NULL,
    "difficulty_level" TEXT NOT NULL,
    "calories_per_minute" REAL,
    "description" TEXT,
    "instructions" TEXT,
    "target_muscles" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "total_duration_minutes" INTEGER,
    "total_calories_burned" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order_index" INTEGER,
    "sets" INTEGER,
    "reps" INTEGER,
    "weight_kg" REAL,
    "duration_minutes" INTEGER,
    "distance_km" REAL,
    "speed_kmh" REAL,
    "incline_percent" REAL,
    "resistance_level" INTEGER,
    "calories_burned" REAL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "WorkoutExercise_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutSessionId" TEXT NOT NULL,
    "workoutExerciseId" TEXT,
    "pain_level" INTEGER,
    "painLocation" TEXT,
    "dizziness_level" INTEGER,
    "stress_level" INTEGER,
    "fatigue_level" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthFeedback_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HealthFeedback_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_value" REAL,
    "current_value" REAL,
    "targetDate" DATETIME,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MLRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workoutSessionId" TEXT,
    "recommended_exercises" TEXT,
    "reasoning" TEXT,
    "userAccepted" BOOLEAN,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MLRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MLRecommendation_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserEquipment_userId_idx" ON "UserEquipment"("userId");

-- CreateIndex
CREATE INDEX "UserEquipment_equipmentId_idx" ON "UserEquipment"("equipmentId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_date_idx" ON "WorkoutSession"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutSessionId_idx" ON "WorkoutExercise"("workoutSessionId");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_token_hash_idx" ON "PasswordReset"("token_hash");
