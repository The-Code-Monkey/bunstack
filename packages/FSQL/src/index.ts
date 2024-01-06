// Import the readdir function from the 'fs/promises' module in Node.js. This function is used to read the contents of a directory.
import fs from 'fs/promises';

// Import various functions from different files in the same directory.
import { default as createFn } from './create';
import { default as readFn } from './read';
import { default as updateFn } from './update';
import { default as deleteFn } from './delete';
import { default as createTableFn } from './createTable';

// Define a type named 'MigrationType'. This type has two properties: 'id' and 'date'.
type MigrationType = {
  id?: string;
  date: Date;
};

// Define a class named 'DB'.
class DB {
  // Declare public properties for the class.
  public folder: string;
  public database: string;
  public table: string;
  
  // Define an async method named 'init'. This method takes two parameters: 'database' and 'folder'.
  public async init(database: string, folder: string = '.') {
    // Initialize the 'database' and 'folder' properties.
    this.database = database;
    this.folder = folder;
    // Call the 'migrate' method.
    await this.migrate();

    // Return the current instance of the class.
    return this;
  }

  // Define a private asynchronous method named 'migrate'.
  private async migrate() {
    // Define a constant 'migrationsDir' and set its value to the 'migrations' environment variable, or "migrations" if the environment variable is not set.
    const migrationsDir = process.env.migrations ?? "migrations";

    // Define a constant 'lastMigration' and set its value to the result of a database query that gets the latest migration.
    const lastMigration = await this.read<MigrationType>("migrations").orderBy("date", "DESC").columns("id").limit(1).get();

    // Check if 'lastMigration' is a string that includes the text "table does not exist".
    if (typeof lastMigration === "string" && lastMigration.includes("table does not exist")) {
      // If the condition is true, create a new table named "migrations" with the specified schema.
      await this.createTable("migrations", {
        add: {
          id: { type: "string", lnth: 255, unique: true, identifier: true },
          date: { type: "date", default: "now" }
        },
        remove: {},
      }).create();

      // Call the 'migrate' method recursively.
      await this.migrate();
    } 
    // Check if 'lastMigration' is an array and if it is empty.
    else if (Array.isArray(lastMigration) && lastMigration.length === 0) {
      // If the condition is true, define a constant 'migrations' and set its value to the sorted list of files in the 'migrationsDir' directory.
      const migrations = (await fs.readdir(migrationsDir)).sort();

      // Iterate over each file in the 'migrations' array.
      for (const migration of migrations) {
        // Define constants for the migration name and data, and the table name.
        const migrationName = migration.split(".")[0];
        const migrationData = await Bun.file(`${migrationsDir}/${migration}`).json();
        const tableName = migrationData.name;

        // If the table name is not defined, throw an error.
        if (!tableName) throw new Error(`Migration ${migrationName} does not have a name`);

        // Check if the migration already exists in the database.
        const migrationExists = await this.read<MigrationType>("migrations").where("id", "=", migrationName).get();

        // If the migration does not exist, create a new record in the "migrations" table and create a new table with the specified schema.
        if (migrationExists.length === 0) {
          await this.create<MigrationType>("migrations").create({ _id: migrationName, date: new Date() });
          await this.createTable(tableName, migrationData).create();
        }
      }
    }
  }

  // Define a private method named 'setTable'. This method takes one parameter 'table' and sets the 'table' property of the class to the value of this parameter.
  private setTable(table: string) {
    this.table = table;
  }

  // Define a private method named 'createTable'. This method takes two parameters: 'table' and 'schema'. It sets the 'table' property of the class to the value of the 'table' parameter and returns a new instance of the 'createTableFn' class, passing 'this' and 'schema' as arguments to the constructor.
  private createTable(table: string, schema: Record<'add' | 'remove', object>): createTableFn {
    this.setTable(table);
    return new createTableFn(this, schema);
  }

  // Define a public method named 'create'. This method takes one parameter 'table'. It sets the 'table' property of the class to the value of the 'table' parameter and returns a new instance of the 'createFn' class, passing 'this' as an argument to the constructor.
  public create<Data extends Record<string, unknown>>(table: string): createFn<Data> {
    this.setTable(table);
    return new createFn<Data>(this);
  }

  // Define a public method named 'read'. This method takes one parameter 'table'. It sets the 'table' property of the class to the value of the 'table' parameter and returns a new instance of the 'readFn' class, passing 'this' as an argument to the constructor.
  public read<Data extends Record<string, unknown>>(table: string): readFn<Data> {
    this.setTable(table);
    return new readFn<Data>(this);
  }

  // Define a public method named 'update'. This method takes one parameter 'table'. It sets the 'table' property of the class to the value of the 'table' parameter and returns a new instance of the 'updateFn' class, passing 'this' as an argument to the constructor.
  public update<Data extends Record<string, unknown>>(table: string): updateFn<Data> {
    this.setTable(table);
    return new updateFn<Data>(this);
  }

  // Define a public method named 'delete'. This method takes one parameter 'table'. It sets the 'table' property of the class to the value of the 'table' parameter and returns a new instance of the 'deleteFn' class, passing 'this' as an argument to the constructor.
  public delete(table: string): deleteFn {
    this.setTable(table);
    return new deleteFn(this);
  }
}

export default DB;
