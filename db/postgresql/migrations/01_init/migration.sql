-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "hostname" VARCHAR(100),
    "browser" VARCHAR(20),
    "os" VARCHAR(20),
    "device" VARCHAR(20),
    "screen" VARCHAR(11),
    "language" VARCHAR(35),
    "country" CHAR(2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "website" (
    "website_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(500),
    "share_id" VARCHAR(64),
    "rev_id" INTEGER NOT NULL DEFAULT 0,
    "user_id" UUID,
    "team_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "website_pkey" PRIMARY KEY ("website_id")
);

-- CreateTable
CREATE TABLE "website_event" (
    "event_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "url" VARCHAR(500) NOT NULL,
    "referrer" VARCHAR(500),
    "event_type" INTEGER NOT NULL DEFAULT 1,
    "event_name" VARCHAR(50),
    "event_data" JSONB,

    CONSTRAINT "website_event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "group" (
    "group_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "group_role" (
    "group_role_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID,

    CONSTRAINT "group_role_pkey" PRIMARY KEY ("group_role_id")
);

-- CreateTable
CREATE TABLE "group_user" (
    "group_user_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "group_user_pkey" PRIMARY KEY ("group_user_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_permission_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_role_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "team" (
    "team_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "team_user" (
    "team_user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "team_user_pkey" PRIMARY KEY ("team_user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_user_id_key" ON "user"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_id_key" ON "session"("session_id");

-- CreateIndex
CREATE INDEX "session_created_at_idx" ON "session"("created_at");

-- CreateIndex
CREATE INDEX "session_website_id_idx" ON "session"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX "website_website_id_key" ON "website"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX "website_share_id_key" ON "website"("share_id");

-- CreateIndex
CREATE INDEX "website_created_at_idx" ON "website"("created_at");

-- CreateIndex
CREATE INDEX "website_share_id_idx" ON "website"("share_id");

-- CreateIndex
CREATE INDEX "website_event_created_at_idx" ON "website_event"("created_at");

-- CreateIndex
CREATE INDEX "website_event_session_id_idx" ON "website_event"("session_id");

-- CreateIndex
CREATE INDEX "website_event_website_id_idx" ON "website_event"("website_id");

-- CreateIndex
CREATE INDEX "website_event_website_id_created_at_idx" ON "website_event"("website_id", "created_at");

-- CreateIndex
CREATE INDEX "website_event_website_id_session_id_created_at_idx" ON "website_event"("website_id", "session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "group_group_id_key" ON "group"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_name_key" ON "group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "group_role_group_role_id_key" ON "group_role"("group_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_user_group_user_id_key" ON "group_user"("group_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_permission_id_key" ON "permission"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_role_id_key" ON "role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_permission_id_key" ON "role_permission"("role_permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_role_id_key" ON "user_role"("user_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_role_id_user_id_key" ON "user_role"("role_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_team_id_key" ON "team"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_name_key" ON "team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_user_team_user_id_key" ON "team_user"("team_user_id");

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_user" ADD CONSTRAINT "group_user_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_user" ADD CONSTRAINT "group_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_user" ADD CONSTRAINT "team_user_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_user" ADD CONSTRAINT "team_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_user" ADD CONSTRAINT "team_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add System User
INSERT INTO "user" (user_id, username, password) VALUES ('41e2b680-648e-4b09-bcd7-3e2b10c06264' ,'admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa');

-- Add Roles
INSERT INTO "role" ("role_id", "name", "description") VALUES (gen_random_uuid(), 'Admin', 'System Admin.');
INSERT INTO "role" ("role_id", "name", "description") VALUES (gen_random_uuid(), 'Member', 'Create and maintain websites.');
INSERT INTO "role" ("role_id", "name", "description") VALUES (gen_random_uuid(), 'Team Owner', 'Create and maintain the team, memberships, websites, and responsible for billing.');
INSERT INTO "role" ("role_id", "name", "description") VALUES (gen_random_uuid(), 'Team Member', 'Create and maintain websites.');
INSERT INTO "role" ("role_id", "name", "description") VALUES (gen_random_uuid(), 'Team Guest', 'View Websites.');

-- Add Permissions
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'admin', 'System Admin');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'website:create', 'Create website');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'website:read', 'Read website');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'website:update', 'Update website');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'website:delete', 'Delete website');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'website:reset', 'Reset website');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'team:create', 'Create team');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'team:update', 'Update team');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'team:delete', 'Delete team');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'team:add-user', 'Add team member');
INSERT INTO "permission" ("permission_id", "name", "description") VALUES (gen_random_uuid(), 'team:remove-user', 'Remove team member');

-- Add Permissions to Roles
INSERT INTO "role_permission"
SELECT gen_random_uuid(), "role_id", "permission_id" 
FROM "role" r JOIN "permission" p ON  0 = 0
WHERE r.name = 'Admin' AND p.name = 'admin';

INSERT INTO "role_permission"
SELECT gen_random_uuid(), "role_id", "permission_id" 
FROM "role" r JOIN "permission" p ON  0 = 0
WHERE r.name = 'Member' AND p.name in ('website:create', 'website:read', 'website:update', 'website:delete', 'website:reset', 'team:create');

INSERT INTO "role_permission"
SELECT gen_random_uuid(), "role_id", "permission_id" 
FROM "role" r JOIN "permission" p ON  0 = 0
WHERE r.name = 'Team Owner' AND p.name in ('website:create', 'website:read', 'website:update', 'website:delete', 'website:reset', 'team:create', 'team:update', 'team:delete', 'team:add-user', 'team:remove-user');

INSERT INTO "role_permission"
SELECT gen_random_uuid(), "role_id", "permission_id" 
FROM "role" r JOIN "permission" p ON  0 = 0 
WHERE r.name = 'Team Member' AND p.name in ('website:create', 'website:read', 'website:update', 'website:delete', 'website:reset');

INSERT INTO "role_permission"
SELECT gen_random_uuid(), "role_id", "permission_id" 
FROM "role" r JOIN "permission" p ON  0 = 0
WHERE r.name = 'Team Guest' AND p.name in ('website:read');