import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create server_type enum
    await queryRunner.query(`
      CREATE TYPE server_type AS ENUM ('local', 'remote');
    `);

    await queryRunner.query(`
      CREATE TABLE "servers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "host" varchar(255) NOT NULL,
        "port" integer NOT NULL DEFAULT 22,
        "username" varchar(255),
        "privateKey" text,
        "type" server_type NOT NULL DEFAULT 'remote',
        "isSwarmManager" boolean DEFAULT false,
        "isSwarmWorker" boolean DEFAULT false,
        "isBuildServer" boolean DEFAULT false,
        "domainName" varchar(255),
        "portMappings" jsonb,
        "labels" jsonb,
        "supportedTypes" text[],
        "status" varchar(50),
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "servers";`);
    await queryRunner.query(`DROP TYPE server_type;`);
  }
}