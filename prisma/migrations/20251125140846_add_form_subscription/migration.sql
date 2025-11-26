-- CreateTable
CREATE TABLE "form_submissions" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "rg" TEXT,
    "cpf" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "mother_name" TEXT NOT NULL,
    "father_name" TEXT,
    "birth_city" TEXT NOT NULL,
    "birth_state" TEXT,
    "marital_status" TEXT,
    "has_driver_license" BOOLEAN NOT NULL DEFAULT false,
    "driver_license_category" TEXT,
    "zip_code" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "residence_time" TEXT,
    "residence_type" TEXT,
    "employment_type" TEXT,
    "company_name" TEXT,
    "company_zip_code" TEXT,
    "company_phone" TEXT,
    "company_street" TEXT,
    "company_neighborhood" TEXT,
    "company_city" TEXT,
    "company_state" TEXT,
    "admission_date" DATE,
    "gross_income" DECIMAL,
    "position" TEXT,
    "activity_description" TEXT,
    "activity_time" TEXT,
    "reference_name" TEXT,
    "reference_phone" TEXT,
    "car_id" UUID,
    "message" TEXT,
    "whatsapp_link_sent" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_submissions_email_idx" ON "form_submissions"("email");

-- CreateIndex
CREATE INDEX "form_submissions_cpf_idx" ON "form_submissions"("cpf");

-- CreateIndex
CREATE INDEX "form_submissions_phone_idx" ON "form_submissions"("phone");

-- CreateIndex
CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions"("created_at");

-- CreateIndex
CREATE INDEX "form_submissions_car_id_idx" ON "form_submissions"("car_id");

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE SET NULL ON UPDATE CASCADE;
