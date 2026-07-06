import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Prevents a therapist from being double-booked: a caregiver can hold at most
 * one appointment slot per start time. Guarded so reruns are safe.
 */
export class AddSlotCaregiverTimeUnique1783800000000
  implements MigrationInterface
{
  name = 'AddSlotCaregiverTimeUnique1783800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_slots_caregiver_time"
      ON "slots" ("caregiver_id", "slot_time")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_slots_caregiver_time"
    `);
  }
}
