import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnvironmentRelations1710000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create environment_type enum
    await queryRunner.query(`
      CREATE TYPE environment_type AS ENUM ('dev', 'prod', 'staging', 'test');
    `);

    // Update environments table to use enum
    await queryRunner.query(`
      ALTER TABLE "environments"
      ALTER COLUMN "type" TYPE environment_type USING type::environment_type,
      ALTER COLUMN "type" SET DEFAULT 'dev'::environment_type;
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "resources"
      ADD CONSTRAINT "FK_resource_environment"
      FOREIGN KEY ("environmentId")
      REFERENCES "environments"("id")
      ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "environments"
      ADD CONSTRAINT "FK_environment_project"
      FOREIGN KEY ("projectId")
      REFERENCES "projects"("id")
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "resources"
      DROP CONSTRAINT "FK_resource_environment";
    `);

    await queryRunner.query(`
      ALTER TABLE "environments"
      DROP CONSTRAINT "FK_environment_project";
    `);

    await queryRunner.query(`
      ALTER TABLE "environments"
      ALTER COLUMN "type" TYPE varchar;
    `);

    await queryRunner.query(`DROP TYPE environment_type;`);
  }
} 