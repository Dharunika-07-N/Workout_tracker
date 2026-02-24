-- Initial migration for Workout Tracker
-- NOTE: This file is a starting point; run real migrations with Prisma or your DB tools.

CREATE TABLE "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone
);

CREATE TABLE "UserProfile" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  height real,
  weight real,
  age integer,
  gender text,
  target_weight real,
  profile_picture_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE "Equipment" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  icon_url text
);

CREATE TABLE "UserEquipment" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES "Equipment"(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE "Exercise" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  equipment_required text[],
  difficulty_level text,
  calories_per_minute real,
  description text,
  instructions jsonb,
  target_muscles text[]
);

CREATE TABLE "WorkoutSession" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text,
  total_duration_minutes integer,
  total_calories_burned real,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

CREATE INDEX ON "WorkoutSession" (user_id, date);

CREATE TABLE "WorkoutExercise" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid NOT NULL REFERENCES "WorkoutSession"(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES "Exercise"(id) ON DELETE CASCADE,
  order_index integer,
  sets integer,
  reps integer,
  weight_kg real,
  duration_minutes integer,
  distance_km real,
  speed_kmh real,
  incline_percent real,
  resistance_level integer,
  calories_burned real,
  completed boolean DEFAULT false,
  notes text
);

CREATE TABLE "HealthFeedback" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid NOT NULL REFERENCES "WorkoutSession"(id) ON DELETE CASCADE,
  workout_exercise_id uuid,
  pain_level integer,
  pain_location text,
  dizziness_level integer,
  stress_level integer,
  fatigue_level integer,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE "UserGoal" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  goal_type text,
  target_value real,
  current_value real,
  target_date date,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE "MLRecommendation" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  workout_session_id uuid,
  recommended_exercises jsonb,
  reasoning text,
  user_accepted boolean,
  created_at timestamp with time zone DEFAULT now()
);
