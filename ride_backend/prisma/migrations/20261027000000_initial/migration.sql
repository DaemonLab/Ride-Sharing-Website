-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "rideID" SERIAL NOT NULL,
    "createdBy" TEXT NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "date" VARCHAR(255) NOT NULL,
    "time" VARCHAR(255) NOT NULL,
    "seatsAvailable" INTEGER NOT NULL,
    "totalSeats" INTEGER,
    "totalCost" DOUBLE PRECISION,
    "vehicleType" VARCHAR(255) NOT NULL,
    "rideStatus" VARCHAR(50) NOT NULL DEFAULT 'Pending',

    CONSTRAINT "rides_pkey" PRIMARY KEY ("rideID")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "rideID" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "requestBy" TEXT NOT NULL,
    "rideStatus" VARCHAR(50) NOT NULL,
    "requestStatus" VARCHAR(50) NOT NULL DEFAULT 'Pending',

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groupChat" (
    "id" SERIAL NOT NULL,
    "rideID" INTEGER NOT NULL,
    "rideOwner" VARCHAR(255),
    "messageBy" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageTime" VARCHAR(255) NOT NULL,
    "messageDate" VARCHAR(255) NOT NULL,

    CONSTRAINT "groupChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "rides_rideStatus_date_time_rideID_idx" ON "rides"("rideStatus", "date", "time", "rideID");

-- CreateIndex
CREATE UNIQUE INDEX "requests_rideID_requestBy_key" ON "requests"("rideID", "requestBy");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_rideID_fkey" FOREIGN KEY ("rideID") REFERENCES "rides"("rideID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_requestBy_fkey" FOREIGN KEY ("requestBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupChat" ADD CONSTRAINT "groupChat_rideID_fkey" FOREIGN KEY ("rideID") REFERENCES "rides"("rideID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groupChat" ADD CONSTRAINT "groupChat_messageBy_fkey" FOREIGN KEY ("messageBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
