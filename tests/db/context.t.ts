import {Context} from '../../src/db/context';
import config from '../../src/config';

test('DbContext.create', async ()=> {
    const connStr = config.DBConnectionString;
    const pwd = process.env['PGPASSWORD'];
    
    const context = await Context.createContext();
    console.log(context.contextId);
    const name = 'property1';
    const value = 'value1';
    await context.set(name, value);
    let _value = await context.get(name);
    console.log(_value);
});
