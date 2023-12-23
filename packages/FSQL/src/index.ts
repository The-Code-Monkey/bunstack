import { default as createFn } from './create';
import { default as readFn } from './read';
import { default as createTableFn } from './createTable';

class DB {
  public folder: string;
  public database: string;
  public table: string;

  constructor(database: string, folder?: string = '.') {
    this.database = database;
    this.folder = folder;
  }

  private async function migrate() {
    const migrationsDir = `${process.cwd()}/${process.env.migrations ?? "migrations"}`;

    const lastMigration = await this.read("migrations").orderBy("date", "DESC").columns("name").limit(1).get();

    if (typeof lastMigration === "string") {
      if (lastMigration.includes("does not exist")) {
        await this.createTable("migrations", {
          name: {
            type: "string",
            lnth: 255,
            unique: true,
          }
        }).create();
      }
    }
  }

  private function setTable(table: string) {
    this.table = table;
  }

  private async function createTable(table: string, schema: object) {
    setTable(table);
    return createTableFn(this, schema);
  }

  public async function read<Data>(table: string): Promise<Data[] | string> {
    setTable(table);
    return readFn(this);
  }

  public async function create<Data>(table: string, data: Data | Data[]): Promise<Data[] | string> {
    setTable(table);
    return createFn(this);
  }
}

export default DB;
