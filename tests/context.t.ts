import { PgContext } from '../src/db/pg-context';
import config from '../src/config';

describe('Context test', () => {

    beforeAll(async () => {
        const connStr = config.DBConnectionString;
        const pwd = process.env['PGPASSWORD'];
    })

    afterAll(async ()=>{
        await PgContext.endPgPool();
    })

    test('PgContext.create', async () => {
        const context = await PgContext.createContext();
        try {
            console.log(context.contextId);
            const name = 'property1';
            const value = 'value1';
            await context.set(name, value);
            let _value = await context.get(name);
            console.log(_value);
            expect(_value).toEqual(value);
        }
        finally {
            context.destroy();
        }
    })
});
