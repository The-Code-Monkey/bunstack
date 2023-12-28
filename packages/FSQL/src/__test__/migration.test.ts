import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';

type UserType = {
  first_name: string;
  last_name: string;
};

describe('migration', () => {
  let db: any;

  beforeAll(async () => {
    db = await new DB().init('testDB');
  });

  test('check that the migrations table is made', async () => {
    const migrations = await db.read('migrations').get();
    expect(migrations.length).toBeGreaterThan(0);
  });
});
