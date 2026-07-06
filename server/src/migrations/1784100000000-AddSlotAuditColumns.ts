import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add audit-only columns to `slots`:
 * - `created_by_user_id`: the staff user (e.g. secretary) who booked the slot.
 * - `cancelled_by_user_id`: the user who cancelled the slot.
 *
 * These record the actor and must never be confused with ownership. The
 * appointment owner remains `patient_id` and the therapist remains
 * `caregiver_id`.
 */
export class AddSlotAuditColumns1784100000000 implements MigrationInterface {
  name = 'AddSlotAuditColumns1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slots"
      ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "slots"
      ADD COLUMN IF NOT EXISTS "cancelled_by_user_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "cancelled_by_user_id"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "created_by_user_id"`);
  }
}
