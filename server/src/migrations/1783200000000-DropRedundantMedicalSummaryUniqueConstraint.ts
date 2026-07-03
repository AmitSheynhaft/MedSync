import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Drops the redundant REL_ unique constraint on patient_medical_summaries.patient_id.
 * The equivalent UQ_ constraint remains and enforces uniqueness.
 */
export class DropRedundantMedicalSummaryUniqueConstraint1783200000000
  implements MigrationInterface
{
  name = 'DropRedundantMedicalSummaryUniqueConstraint1783200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patient_medical_summaries"
      DROP CONSTRAINT IF EXISTS "REL_patient_medical_summaries_patient_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patient_medical_summaries"
      ADD CONSTRAINT "REL_patient_medical_summaries_patient_id" UNIQUE ("patient_id")
    `);
  }
}
