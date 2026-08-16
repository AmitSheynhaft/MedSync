import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePatientAddressNullable1784200000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE patients ALTER COLUMN address DROP NOT NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE patients SET address = '' WHERE address IS NULL;
      ALTER TABLE patients ALTER COLUMN address SET NOT NULL;
    `);
  }
}
