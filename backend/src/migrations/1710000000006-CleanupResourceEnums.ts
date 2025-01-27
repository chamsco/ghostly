import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupResourceEnums1710000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the environment column from resources table
    await queryRunner.query(`
      ALTER TABLE "resources"
      DROP COLUMN "environment"
    `);

    // Drop the environment_enum type
    await queryRunner.query(`DROP TYPE "environment_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the environment_enum type
    await queryRunner.query(`
      CREATE TYPE "environment_enum" AS ENUM (
        'development',
        'staging',
        'production'
      )
    `);

    // Add back the environment column
    await queryRunner.query(`
      ALTER TABLE "resources"
      ADD COLUMN "environment" environment_enum NOT NULL DEFAULT 'development'
    `);
  }
} 