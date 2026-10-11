ALTER TABLE "Conversation" ADD COLUMN "name" VARCHAR(80), ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Conversation_archived_lastMessageAt_idx" ON "Conversation"("archived", "lastMessageAt");
