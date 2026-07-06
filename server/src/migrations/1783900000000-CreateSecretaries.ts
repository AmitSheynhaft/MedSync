import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSecretaries1783900000000 implements MigrationInterface {
  name = 'CreateSecretaries1783900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "secretaries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "id_number" varchar NOT NULL,
        "clinic_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_secretaries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_secretaries_user_id" UNIQUE ("user_id"),
        CONSTRAINT "UQ_secretaries_id_number" UNIQUE ("id_number")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "secretaries"
      DROP CONSTRAINT IF EXISTS "FK_secretaries_user_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "secretaries"
      ADD CONSTRAINT "FK_secretaries_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "secretaries"
      DROP CONSTRAINT IF EXISTS "FK_secretaries_clinic_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "secretaries"
      ADD CONSTRAINT "FK_secretaries_clinic_id"
      FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "secretaries"`);
  }
}
