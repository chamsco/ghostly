import { MigrationInterface, QueryRunner } from "typeorm";

export class AddErrorColumnToResources1710000000008 implements MigrationInterface {
    name = 'AddErrorColumnToResources1710000000008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "resources"
            ADD COLUMN "error" varchar NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "resources"
            DROP COLUMN "error"
        `);
    }
} 