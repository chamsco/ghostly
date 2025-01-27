import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResourceIndexes1710000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'FK_resources_environment'
        ) THEN
          ALTER TABLE "resources"
          ADD CONSTRAINT "FK_resources_environment"
          FOREIGN KEY ("environmentId")
          REFERENCES "environments"("id")
          ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // Resource indexes
    await queryRunner.query(`
      -- Single-column indexes
      CREATE INDEX IF NOT EXISTS "IDX_resources_environment" 
      ON "resources" ("environmentId");

      CREATE INDEX IF NOT EXISTS "IDX_resources_server" 
      ON "resources" ("serverId");

      -- Composite indexes for resources
      CREATE INDEX IF NOT EXISTS "IDX_resources_env_status" 
      ON "resources" ("environmentId", "status")
      WHERE "status" IN ('running', 'pending');

      CREATE INDEX IF NOT EXISTS "IDX_resources_server_type" 
      ON "resources" ("serverId", "type")
      INCLUDE ("status", "environmentId");

      CREATE INDEX IF NOT EXISTS "IDX_resources_project_status" 
      ON "resources" ("projectId", "status")
      INCLUDE ("name", "type");

      CREATE INDEX IF NOT EXISTS "IDX_resources_type_status"
      ON "resources" ("type", "status")
      INCLUDE ("name", "environmentId");
    `);

    // Project and Environment indexes
    await queryRunner.query(`
      -- Project indexes
      CREATE INDEX IF NOT EXISTS "IDX_projects_owner_status" 
      ON "projects" ("ownerId", "status")
      INCLUDE ("name", "createdAt");

      CREATE INDEX IF NOT EXISTS "IDX_projects_owner_recent"
      ON "projects" ("ownerId", "createdAt" DESC)
      INCLUDE ("name", "status")
      WHERE "status" != 'deleted';

      -- Environment indexes
      CREATE INDEX IF NOT EXISTS "IDX_environments_project" 
      ON "environments" ("project_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "resources"
      DROP CONSTRAINT IF EXISTS "FK_resources_environment";
    `);

    // Drop all indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_resources_environment";
      DROP INDEX IF EXISTS "IDX_resources_server";
      DROP INDEX IF EXISTS "IDX_resources_env_status";
      DROP INDEX IF EXISTS "IDX_resources_server_type";
      DROP INDEX IF EXISTS "IDX_resources_project_status";
      DROP INDEX IF EXISTS "IDX_resources_type_status";
      DROP INDEX IF EXISTS "IDX_projects_owner_status";
      DROP INDEX IF EXISTS "IDX_projects_owner_recent";
      DROP INDEX IF EXISTS "IDX_environments_project";
    `);
  }
} 