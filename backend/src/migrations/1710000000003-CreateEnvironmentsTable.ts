import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CreateEnvironmentsTable1710000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE environment_type AS ENUM ('dev', 'prod', 'staging', 'test');
      CREATE TABLE "environments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "type" environment_type NOT NULL,
        "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "environments";
      DROP TYPE environment_type;
    `);
  }
} 