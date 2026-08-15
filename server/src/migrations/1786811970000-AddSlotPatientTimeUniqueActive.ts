import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Prevent a patient from holding two scheduled appointments at the same time,
 * even with different therapists. Guarded so reruns are safe.
 */
export class AddSlotPatientTimeUniqueActive1786811970000
  implements MigrationInterface
{
  name = 'AddSlotPatientTimeUniqueActive1786811970000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_slots_patient_time_active"
      ON "slots" ("patient_id", "slot_time")
      WHERE "status" = 'scheduled'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_slots_patient_time_active"
    `);
  }
}