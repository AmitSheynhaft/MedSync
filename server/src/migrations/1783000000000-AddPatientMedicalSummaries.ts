import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientMedicalSummaries1783000000000
  implements MigrationInterface
{
  name = 'AddPatientMedicalSummaries1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "patient_medical_summaries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patient_id" uuid NOT NULL,
        "summary_text" text NOT NULL,
        "generated_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_patient_medical_summaries_patient_id" UNIQUE ("patient_id"),
        CONSTRAINT "REL_patient_medical_summaries_patient_id" UNIQUE ("patient_id"),
        CONSTRAINT "PK_patient_medical_summaries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "patient_medical_summaries"
      ADD CONSTRAINT "FK_patient_medical_summaries_patient_id"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "visit_summaries"
      ADD COLUMN "included_in_medical_summary" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "document_summaries"
      ADD COLUMN "included_in_medical_summary" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_summaries" DROP COLUMN "included_in_medical_summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visit_summaries" DROP COLUMN "included_in_medical_summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_medical_summaries" DROP CONSTRAINT "FK_patient_medical_summaries_patient_id"`,
    );
    await queryRunner.query(`DROP TABLE "patient_medical_summaries"`);
  }
}
