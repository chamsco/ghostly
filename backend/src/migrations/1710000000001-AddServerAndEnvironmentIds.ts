import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerAndEnvironmentIds1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "resources"
      ADD COLUMN "serverId" uuid NULL,
      ADD COLUMN "environmentId" uuid NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "resources"
      DROP COLUMN "serverId",
      DROP COLUMN "environmentId"
    `);
  }
} 