import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClinics1783300000000 implements MigrationInterface {
  name = 'CreateClinics1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clinics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "address" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clinics" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_clinics_name" UNIQUE ("name")
      )
    `);

    // Seed a starter set of clinics so backfill + registration dropdowns
    // have data. Idempotent via ON CONFLICT on the unique name.
    await queryRunner.query(`
      INSERT INTO "clinics" ("name", "address")
      VALUES
        ('מרפאת מרכז', 'תל אביב'),
        ('מרפאת צפון', 'חיפה'),
        ('מרפאת דרום', 'באר שבע'),
        ('מרפאת ירושלים', 'ירושלים')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "clinics"`);
  }
}
