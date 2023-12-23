import { default as createFn } from './create';
import { default as readFn } from './read';
import { default as createTableFn } from './createTable';

class DB {
  public folder: string;
  public database: string;
  public table: string;

  constructor(database: string, folder: string = '.') {
    this.database = database;
    this.folder = folder;

    this.migrate();
  }

  private async migrate() {
    // const migrationsDir = `${process.cwd()}/${process.env.migrations ?? "migrations"}`;

    const lastMigration = await this.read("migrations").orderBy("date", "DESC").columns("name").limit(1).get();

    if (typeof lastMigration === "string") {
      if (lastMigration.includes("table does not exist")) {
        const result = await this.createTable("migrations", {
          name: {
            type: "string",
            lnth: 255,
            unique: true,
          }
        }).create();

        if (result === true) {
          this.migrate();
        }
      }
    }
  }

  private setTable(table: string) {
    this.table = table;
  }

  private createTable(table: string, schema: object): any {
    this.setTable(table);
    return new createTableFn(this, schema);
  }

  public read<Data>(table: string): any {
    this.setTable(table);
    return new readFn(this);
  }

  public create<Data>(table: string, data: Data | Data[]): any {
    this.setTable(table);
    return createFn(this);
  }
}

export default DB;
