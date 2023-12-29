import { unlink } from "node:fs/promises";

import DB from '.';

class deleteFn {
  public table: string;
  public folder: string;
  public database: string;

  constructor(_this: DB) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  public async delete(id: string) {
    const schemaPath = Bun.file(`${this.folder}/${this.database}/${this.table}/schema.json`);

    const schemaExists = await schemaPath.exists();

    if (!schemaExists) {
      return `${this.table} - table does not exist`;
    }

    const path = `${this.folder}/${this.database}/${this.table}/${id}.json`;

    const fileExists = await Bun.file(path).exists();

    if (!fileExists) {
      return `${id} does not exist`;
    }

    await unlink(path);

    return `Succesfully deleted the entry`;
  }

}

export default deleteFn;
