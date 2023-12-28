import { describe, beforeAll, test, expect } from 'bun:test';

import DB from '../index';
import update from '../update';
import read from '../read';

describe('update', () => {
    let db: DB;
    let updateInstance: update<object>;
    let readInstance: read<object>;

    beforeAll(async () => {
        db = await new DB().init('testDB');
        updateInstance = db.update('users');
        readInstance = db.read('users');
    });

    test('update index', async () => {
      const data = {
        age: 50
      };

      const result = await updateInstance.update('99', data);
      const newData = await readInstance.where('id', '=', '99').get();
        
      expect(newData[0].age).toEqual(data.age);
    });

    test('does not exist', async () => {
        const result = await updateInstance.update('9000', {});
        expect(result.includes('does not exist')).toEqual(true);
    });

});
