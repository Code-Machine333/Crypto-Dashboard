-- CreateTable
CREATE TABLE "SharedWidget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "widgetType" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SharedWidget_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WidgetCollaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "widgetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "WidgetCollaborator_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "SharedWidget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WidgetCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WidgetComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "widgetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WidgetComment_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "SharedWidget" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WidgetComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WidgetComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WidgetComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedWidget_shareToken_key" ON "SharedWidget"("shareToken");

-- CreateIndex
CREATE INDEX "SharedWidget_ownerId_idx" ON "SharedWidget"("ownerId");

-- CreateIndex
CREATE INDEX "SharedWidget_isPublic_idx" ON "SharedWidget"("isPublic");

-- CreateIndex
CREATE INDEX "SharedWidget_shareToken_idx" ON "SharedWidget"("shareToken");

-- CreateIndex
CREATE INDEX "WidgetCollaborator_userId_idx" ON "WidgetCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetCollaborator_widgetId_userId_key" ON "WidgetCollaborator"("widgetId", "userId");

-- CreateIndex
CREATE INDEX "WidgetComment_widgetId_idx" ON "WidgetComment"("widgetId");

-- CreateIndex
CREATE INDEX "WidgetComment_userId_idx" ON "WidgetComment"("userId");
