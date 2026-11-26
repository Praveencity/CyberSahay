CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EvidenceFile_size_check" CHECK ("size" BETWEEN 1 AND 10485760 AND "size" = octet_length("bytes")),
    CONSTRAINT "EvidenceFile_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "EvidenceFile_complaintId_createdAt_id_idx" ON "EvidenceFile"("complaintId", "createdAt", "id");
