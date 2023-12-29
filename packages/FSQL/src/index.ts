import { readdir } from 'node:fs/promises';

import { default as createFn } from './create';
import { default as readFn } from './read';
import { default as updateFn } from './update';
import { default as deleteFn } from './delete';
import { default as createTableFn } from './createTable';

type MigrationType = {
  id?: string;
  date: Date;
};

class DB {
  public folder: string;
  public database: string;
  public table: string;
  
  public async init(database: string, folder: string = '.') {
    this.database = database;
    this.folder = folder;
    await this.migrate();

    return this;
  }

  private async migrate() {
    const migrationsDir = `${process.env.migrations ?? "migrations"}`;
    const lastMigration = await this.read<MigrationType>("migrations").orderBy("date", "DESC").columns("id").limit(1).get();

    if (typeof lastMigration === "string") {
      if (lastMigration.includes("table does not exist")) {
        const result = await (this.createTable("migrations", {
          add: {
            id: {
              type: "string",
              lnth: 255,
              unique: true,
              identifier: true,
            },
            date: {
              type: "date",
              default: "now",
            }
          },
          remove: {},
        }).create());

        if (result) {
          await this.migrate();
        }
      }
    } else {
      if (lastMigration.length === 0) {
        const migrations = await readdir(migrationsDir).catch((err) => {
          console.log(err)
          throw new Error(err.message);
        });

        migrations.sort((a, b) => {
          if (a < b) {
            return -1;
          } else if (a > b) {
            return 1;
          } else {
            return 0;
          }
        });

        for (const migration of migrations) {
          const migrationName = migration.split(".")[0];
          const migrationData = await Bun.file(`${migrationsDir}/${migration}`).json();
          const tableName = migrationData.name;

          if (!tableName) {
            throw new Error(`Migration ${migrationName} does not have a name`);
          }

          // check migrations table for migration name
          const migrationExists = await this.read<MigrationType>("migrations").where("id", "=", migrationName).get();

          if (migrationExists.length === 0) {
            // add row to migrations table with migration name
            await this.create<MigrationType>("migrations").create({
              _id: migrationName,
              date: new Date()
            });

            await this.createTable(tableName, migrationData).create();
          }
        }
      }
    }
  }

  private setTable(table: string) {
    this.table = table;
  }

  private createTable(table: string, schema: Record<'add' | 'remove', object>): createTableFn {
    this.setTable(table);
    return new createTableFn(this, schema);
  }

  public create<Data>(table: string): createFn<Data> {
    this.setTable(table);
    return new createFn<Data>(this);
  }

  public read<Data>(table: string): readFn<Data> {
    this.setTable(table);
    return new readFn<Data>(this);
  }

  public update<Data>(table: string): updateFn<Data> {
    this.setTable(table);
    return new updateFn<Data>(this);
  }

  public delete(table: string): deleteFn {
    this.setTable(table);
    return new deleteFn(this);
  }
}

export default DB;
