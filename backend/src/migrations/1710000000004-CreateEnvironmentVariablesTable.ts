import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnvironmentVariablesTable1710000000004
 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE environment_variables (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        is_secret BOOLEAN NOT NULL DEFAULT false,
        environment_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_environment_variable
          FOREIGN KEY (environment_id)
          REFERENCES environments(id)
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE environment_variables`);
  }
} 