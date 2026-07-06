import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminRole1783800000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, name, description)
      VALUES (gen_random_uuid(), 'admin', 'System administrator')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE name = 'admin';
    `);
  }
}
