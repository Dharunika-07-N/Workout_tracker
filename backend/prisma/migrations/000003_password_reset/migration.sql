-- Add PasswordReset table
CREATE TABLE "PasswordReset" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX ON "PasswordReset" (user_id);
CREATE INDEX ON "PasswordReset" (token_hash);
