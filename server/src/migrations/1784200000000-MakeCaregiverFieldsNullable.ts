import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCaregiverFieldsNullable1784200000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE caregivers
        ALTER COLUMN license_number DROP NOT NULL,
        ALTER COLUMN specialization DROP NOT NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE caregivers
        ALTER COLUMN license_number SET NOT NULL,
        ALTER COLUMN specialization SET NOT NULL;
    `);
  }
}
