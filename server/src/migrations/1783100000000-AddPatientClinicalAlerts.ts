import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientClinicalAlerts1783100000000
  implements MigrationInterface
{
  name = 'AddPatientClinicalAlerts1783100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "clinical_alert_category_enum" AS ENUM (
        'ALLERGY', 'LIFE_THREATENING', 'CHRONIC'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "clinical_alert_severity_enum" AS ENUM (
        'HIGH', 'MEDIUM', 'LOW'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "clinical_alert_source_enum" AS ENUM (
        'AI', 'MANUAL'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "patient_clinical_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "category" "clinical_alert_category_enum" NOT NULL,
        "severity" "clinical_alert_severity_enum" NOT NULL,
        "label" varchar(80) NOT NULL,
        "normalized_key" varchar(120) NOT NULL,
        "source" "clinical_alert_source_enum" NOT NULL DEFAULT 'AI',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_clinical_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_patient_clinical_alerts_dedupe"
          UNIQUE ("patient_id", "category", "normalized_key")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_patient_clinical_alerts_patient_id"
      ON "patient_clinical_alerts" ("patient_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_clinical_alerts"
      ADD CONSTRAINT "FK_patient_clinical_alerts_patient_id"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_clinical_alerts" DROP CONSTRAINT "FK_patient_clinical_alerts_patient_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_patient_clinical_alerts_patient_id"`,
    );
    await queryRunner.query(`DROP TABLE "patient_clinical_alerts"`);
    await queryRunner.query(`DROP TYPE "clinical_alert_source_enum"`);
    await queryRunner.query(`DROP TYPE "clinical_alert_severity_enum"`);
    await queryRunner.query(`DROP TYPE "clinical_alert_category_enum"`);
  }
}
