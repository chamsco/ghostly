import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResourcesTable1710000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create resource type enum
    await queryRunner.query(`
      CREATE TYPE "resource_type_enum" AS ENUM (
        'database',
        'service',
        'website',
        'github',
        'gitlab',
        'bitbucket'
      )
    `);

    // Create resource status enum
    await queryRunner.query(`
      CREATE TYPE "resource_status_enum" AS ENUM (
        'pending',
        'running',
        'stopped',
        'failed',
        'error'
      )
    `);

    // Create environment enum
    await queryRunner.query(`
      CREATE TYPE "environment_enum" AS ENUM (
        'development',
        'staging',
        'production'
      )
    `);

    // Create resources table
    await queryRunner.query(`
      CREATE TABLE "resources" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "type" resource_type_enum NOT NULL,
        "status" resource_status_enum NOT NULL DEFAULT 'pending',
        "error" varchar NULL,
        "containerId" varchar NULL,
        "environment" environment_enum NOT NULL,
        "environmentVariables" jsonb NULL,
        "config" jsonb NOT NULL,
        "projectId" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_resources_project" FOREIGN KEY ("projectId")
          REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_resource_name_project" UNIQUE ("name", "projectId")
      )
    `);

    // Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_resources_project" ON "resources" ("projectId")
    `);

    // Create index for status queries
    await queryRunner.query(`
      CREATE INDEX "IDX_resources_status" ON "resources" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_resources_status"`);
    await queryRunner.query(`DROP INDEX "IDX_resources_project"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "resources"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "environment_enum"`);
    await queryRunner.query(`DROP TYPE "resource_status_enum"`);
    await queryRunner.query(`DROP TYPE "resource_type_enum"`);
  }
} 