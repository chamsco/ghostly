import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectsTable1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "ownerId" uuid NOT NULL,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now(),
        CONSTRAINT "FK_project_owner" FOREIGN KEY ("ownerId") 
          REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "projects"`);
  }
} 