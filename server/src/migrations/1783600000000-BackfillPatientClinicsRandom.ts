import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPatientClinicsRandom1783600000000
  implements MigrationInterface
{
  name = 'BackfillPatientClinicsRandom1783600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Give each existing patient one RANDOM clinic membership. The correlated
    // reference to p."id" forces the subquery to be re-evaluated per row.
    await queryRunner.query(`
      INSERT INTO "patient_clinics" ("patient_id", "clinic_id")
      SELECT p."id", (
        SELECT cl."id" FROM "clinics" cl
        ORDER BY random(), p."id"
        LIMIT 1
      )
      FROM "patients" p
      WHERE EXISTS (SELECT 1 FROM "clinics")
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(): Promise<void> {
    // Data-only backfill; nothing to revert deterministically.
  }
}
