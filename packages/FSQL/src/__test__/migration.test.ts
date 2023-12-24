import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';

type UserType = {
  first_name: string;
  last_name: string;
};

describe('FSQL', () => {
  let db: any;

  beforeAll(async () => {
    db = await new DB().init('testDB');
  });

  test('create and read data', async () => {
    const data = { first_name: 'Test', last_name: 'User' };
    const table = 'users';

    // Test create
    const createdData = await db.create(table).create(data);
    expect(createdData).toEqual(data);

    // Test read
    const readData = await db.read(table).get();
    expect(readData).toEqual([data]);
  });
});