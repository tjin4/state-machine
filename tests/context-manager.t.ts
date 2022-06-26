import { IContext } from "../src/types";
import { ContextManager } from "../src/context-manager";
import { PgPool } from '../src/db/pg-pool';

describe('ContextManager tests', ()=>{

    let _context : IContext|undefined = undefined;

    beforeAll(async () => {
    })

    afterAll(async ()=>{
        await PgPool.destroyInstance();
    })

    beforeEach(async()=>{

    })

    afterEach(async () => {
        if(_context !== undefined){
            const name = 'TestProp1';
            const value = 'TestProp1Value';
            await _context.set(name, value);
            expect(await _context.get(name)).toBe(value);
            await _context.destroy();
        }
    })
   

    test('ContextManager.activityContext', async ()=>{
        const activityId = 'TestActivityId';
        const context = await ContextManager.instance.createActivityContext(activityId);
        _context = context;
        expect(context.activityId).toBe(activityId);

        // const name = 'TestProp1';
        // const value = 'TestProp1Value';
        // await context.set(name, value);
        // expect(await context.get(name)).toBe(value);
        
    })

    test('ContextManager.stateContext', async ()=>{
        const stateMachineContextId = 'TestStateMachine1';
        const stateId = 'TestState1'
        const context = await ContextManager.instance.createStateContext(stateMachineContextId, stateId);
        _context = context;
        expect(context.stateMachineContextId).toBe(stateMachineContextId);
        expect(context.stateId).toBe(stateId);
        
        // const name = 'TestProp1';
        // const value = 'TestProp1Value';
        // await context.set(name, value);
        // expect(await context.get(name)).toBe(value);
    })

    test('ContextManager.stateMachineContext', async ()=>{
        const stateMachineDefId = 'TestStateMachine1';
        const context = await ContextManager.instance.createStateMachineContext(stateMachineDefId);
        _context = context;
        expect(context.stateMachineDefId).toBe(stateMachineDefId);
        
        // const name = 'TestProp1';
        // const value = 'TestProp1Value';
        // await context.set(name, value);
        // expect(await context.get(name)).toBe(value);
    })    
})