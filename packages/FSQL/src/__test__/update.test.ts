import { describe, beforeAll, test, expect, beforeEach } from 'bun:test';

import DB from '../index';
import update from '../update';
import read from '../read';

describe('update', () => {
    let db: any;
    let updateInstance: update<any>;
    let readInstance: read<any>;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        updateInstance = db.update('users');
        readInstance = db.read('users');
    });

    test('update index', () => {
      const data = {
        age: 50
      };

      const result = await updateInstance.update('99', data);
      const newData = await readInstance.where('id', '=', '99').get();

      expect(newData.age).toEqual(data.age);
    });

});
