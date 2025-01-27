import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_method enum
    await queryRunner.query(`
      CREATE TYPE auth_method AS ENUM ('password', 'two_factor', 'biometrics');
    `);

    // Create users table with all columns
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "fullName" varchar(255) NOT NULL,
        "username" varchar(255) NOT NULL UNIQUE,
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "isVerified" boolean NOT NULL DEFAULT false,
        "isAdmin" boolean NOT NULL DEFAULT false,
        "twoFactorSecret" varchar(255),
        "twoFactorEnabled" boolean NOT NULL DEFAULT false,
        "isBiometricsEnabled" boolean NOT NULL DEFAULT false,
        "biometricCredentialId" varchar(255),
        "biometricChallenge" varchar(255),
        "enabledAuthMethods" auth_method[] DEFAULT '{password}',
        "requiresAdditionalAuth" boolean NOT NULL DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Create server_type enum
    await queryRunner.query(`
      CREATE TYPE server_type AS ENUM ('local', 'remote');
    `);

    // Create servers table with all columns
    await queryRunner.query(`
      CREATE TABLE "servers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "host" varchar(255) NOT NULL,
        "port" int NOT NULL,
        "username" varchar(255),
        "privateKey" text,
        "type" server_type NOT NULL DEFAULT 'remote',
        "isSwarmManager" boolean NOT NULL DEFAULT false,
        "isSwarmWorker" boolean NOT NULL DEFAULT false,
        "isBuildServer" boolean NOT NULL DEFAULT false,
        "domainName" varchar(255),
        "portMappings" jsonb,
        "labels" jsonb,
        "supportedTypes" text[] DEFAULT '{}',
        "status" varchar(255) NOT NULL DEFAULT 'offline',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "servers";`);
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TYPE server_type;`);
    await queryRunner.query(`DROP TYPE auth_method;`);
  }
}