-- CreateTable
CREATE TABLE "CollectionPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessibility" TEXT,
    "capacity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollectionPoint_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Italy',
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "collectionPointId" INTEGER NOT NULL,
    CONSTRAINT "Address_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WasteType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "iconName" TEXT,
    "disposalInfo" TEXT NOT NULL DEFAULT '',
    "examples" TEXT
);

-- CreateTable
CREATE TABLE "CollectionSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collectionPointId" INTEGER NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT false,
    "tuesday" BOOLEAN NOT NULL DEFAULT false,
    "wednesday" BOOLEAN NOT NULL DEFAULT false,
    "thursday" BOOLEAN NOT NULL DEFAULT false,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "openingTime" TEXT,
    "closingTime" TEXT,
    "notes" TEXT,
    "isAlwaysOpen" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CollectionSchedule_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "collectionPointId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "images" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "resolutionNotes" TEXT,
    CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "CollectionPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "oauthProvider" TEXT NOT NULL,
    "oauthId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "surname" TEXT,
    "cellphone" TEXT
);

-- CreateTable
CREATE TABLE "Operator" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "organizationName" TEXT NOT NULL,
    "vatNumber" TEXT,
    "telephone" TEXT NOT NULL,
    "website" TEXT,
    CONSTRAINT "Operator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CollectionPointToWasteType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CollectionPointToWasteType_A_fkey" FOREIGN KEY ("A") REFERENCES "CollectionPoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CollectionPointToWasteType_B_fkey" FOREIGN KEY ("B") REFERENCES "WasteType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_collectionPointId_key" ON "Address"("collectionPointId");

-- CreateIndex
CREATE UNIQUE INDEX "WasteType_name_key" ON "WasteType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionSchedule_collectionPointId_key" ON "CollectionSchedule"("collectionPointId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionPointToWasteType_AB_unique" ON "_CollectionPointToWasteType"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionPointToWasteType_B_index" ON "_CollectionPointToWasteType"("B");
