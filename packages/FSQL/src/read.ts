class read {
  public table: string;
  public folder: string;
  public database: string;
  
  constructor(_this: any) {
    this.table = _this.table;
    this.folder = _this.folder;
    this.database = _this.database;
  }

  public orderBy(column: string, order: 'ASC' | 'DESC') {
    return this;
  }

  public columns(...args: string[]) {
    return this;
  }

  public limit(number: number) {
    return this;
  }

  // @TODO: make this a promise 
  public get(): any {
    return {};
  }
}

export default read;
