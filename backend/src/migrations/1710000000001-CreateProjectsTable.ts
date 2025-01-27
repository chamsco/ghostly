import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectsTable1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "serverId" uuid,
        "ownerId" uuid NOT NULL,
        "status" varchar(255) NOT NULL DEFAULT 'created',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "fk_server" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "projects";`);
  }
} 