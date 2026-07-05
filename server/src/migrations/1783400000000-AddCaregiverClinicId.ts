import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCaregiverClinicId1783400000000 implements MigrationInterface {
  name = 'AddCaregiverClinicId1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "caregivers"
      ADD COLUMN IF NOT EXISTS "clinic_id" uuid
    `);

    // Assign each existing caregiver a RANDOM clinic. The correlated
    // reference to c."id" forces the subquery to be re-evaluated per row.
    await queryRunner.query(`
      UPDATE "caregivers" AS c
      SET "clinic_id" = (
        SELECT cl."id" FROM "clinics" cl
        ORDER BY random(), c."id"
        LIMIT 1
      )
      WHERE c."clinic_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "caregivers"
      DROP CONSTRAINT IF EXISTS "FK_caregivers_clinic_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "caregivers"
      ADD CONSTRAINT "FK_caregivers_clinic_id"
      FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "caregivers"
      DROP CONSTRAINT IF EXISTS "FK_caregivers_clinic_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "caregivers" DROP COLUMN IF EXISTS "clinic_id"
    `);
  }
}
