import { PgContextManager } from '../src/db/pg-context';
import { PgPool } from '../src/db/pg-pool';
import { CONTEXT_TYPE } from '../src/types';

describe('Context test', () => {

    beforeAll(async () => {
    })

    afterAll(async ()=>{
        await PgPool.destroyInstance();
    })

    test('PgContext.create', async () => {
        const context = await PgContextManager.instance.createContext(undefined, CONTEXT_TYPE.STATE_LOCAL, 'TEST');
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
            await context.destroy();
        }
    })
});
