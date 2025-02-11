import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDeviceTable1710000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'device',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'lastIp',
            type: 'varchar',
          },
          {
            name: 'userAgent',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'lastActive',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'device',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('device');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('device', foreignKey);
      }
    }
    await queryRunner.dropTable('device');
  }
} 