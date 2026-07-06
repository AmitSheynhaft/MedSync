import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add a lifecycle `status` column to the `slots` table.
 *
 * Existing rows are treated as `scheduled` (the previous implicit state).
 * Cancellation is now a soft state so history is preserved instead of the
 * secretary deleting the row outright.
 *
 * The full unique index on `(caregiver_id, slot_time)` is replaced with a
 * partial one that only applies to `status = 'scheduled'`, so a cancelled
 * slot doesn't block re-booking the same time.
 */
export class AddSlotStatus1784000000000 implements MigrationInterface {
  name = 'AddSlotStatus1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slots"
      ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'scheduled'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_slots_status" ON "slots" ("status")
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_slots_caregiver_time"`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_slots_caregiver_time_active"
      ON "slots" ("caregiver_id", "slot_time")
      WHERE "status" = 'scheduled'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_slots_caregiver_time_active"`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_slots_caregiver_time"
      ON "slots" ("caregiver_id", "slot_time")
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_slots_status"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "status"`);
  }
}
