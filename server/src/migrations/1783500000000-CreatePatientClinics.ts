import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientClinics1783500000000 implements MigrationInterface {
  name = 'CreatePatientClinics1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_clinics" (
        "patient_id" uuid NOT NULL,
        "clinic_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_clinics" PRIMARY KEY ("patient_id", "clinic_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_patient_clinics_clinic_id"
      ON "patient_clinics" ("clinic_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      DROP CONSTRAINT IF EXISTS "FK_patient_clinics_patient_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      ADD CONSTRAINT "FK_patient_clinics_patient_id"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      DROP CONSTRAINT IF EXISTS "FK_patient_clinics_clinic_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      ADD CONSTRAINT "FK_patient_clinics_clinic_id"
      FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      DROP CONSTRAINT IF EXISTS "FK_patient_clinics_clinic_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "patient_clinics"
      DROP CONSTRAINT IF EXISTS "FK_patient_clinics_patient_id"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_patient_clinics_clinic_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_clinics"`);
  }
}
