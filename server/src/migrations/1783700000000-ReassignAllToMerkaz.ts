import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReassignAllToMerkaz1783700000000 implements MigrationInterface {
  name = 'ReassignAllToMerkaz1783700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all caregivers to מרפאת מרכז
    await queryRunner.query(`
      UPDATE "caregivers"
      SET "clinic_id" = (SELECT "id" FROM "clinics" WHERE "name" = 'מרפאת מרכז' LIMIT 1)
      WHERE EXISTS (SELECT 1 FROM "clinics" WHERE "name" = 'מרפאת מרכז')
    `);

    // Replace all patient_clinics rows with מרפאת מרכז
    await queryRunner.query(`
      DELETE FROM "patient_clinics"
    `);

    await queryRunner.query(`
      INSERT INTO "patient_clinics" ("patient_id", "clinic_id")
      SELECT p."id", cl."id"
      FROM "patients" p
      CROSS JOIN "clinics" cl
      WHERE cl."name" = 'מרפאת מרכז'
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-randomise (best-effort rollback)
    await queryRunner.query(`
      UPDATE "caregivers" AS c
      SET "clinic_id" = (
        SELECT cl."id" FROM "clinics" cl ORDER BY random(), c."id" LIMIT 1
      )
    `);

    await queryRunner.query(`DELETE FROM "patient_clinics"`);

    await queryRunner.query(`
      INSERT INTO "patient_clinics" ("patient_id", "clinic_id")
      SELECT p."id", (SELECT cl."id" FROM "clinics" cl ORDER BY random(), p."id" LIMIT 1)
      FROM "patients" p
      WHERE EXISTS (SELECT 1 FROM "clinics")
      ON CONFLICT DO NOTHING
    `);
  }
}
