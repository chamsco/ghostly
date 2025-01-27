import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerAndEnvironmentIds1710000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // These columns are now added in the CreateResourcesTable migration
    // No need to add them here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No changes to revert
  }
} 