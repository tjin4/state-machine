import { StateMachineEngine } from '../src/state-machine-engine';
import { TestActivityProvider } from './test-activity-provider';
import { readFileSync } from 'fs';
import path from 'path';
import { StateMachine } from '../src/state-machine';
import { EXEC_STATUS } from '../src/types';
import { PgPool } from '../src/db/pg-pool';

describe.skip('StateMachineEngin Tests', ()=>{
    afterAll(async ()=>{
        await PgPool.destroyInstance();
    })
    
    test('StateMachineEngine.run', async () => {
     
        const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();
    
        const engine = new StateMachineEngine();
        engine.broker.register(new TestActivityProvider());
    
        const stateMachine = await engine.createStateMachine(doc, {user: 'tao'}, true);
    
        for (let i = 0; i < 1; i++) {
            await engine.runStateMachine(stateMachine.context.contextId);
            console.log(JSON.stringify(stateMachine.context, null, 2));
            expect(await stateMachine.context.getExecStatus()).toEqual(EXEC_STATUS.RUNNING);
            expect(await stateMachine.context.getStateId()).toEqual('state1');
    
            await engine.dispatchEvent({ eventId: 'event1', stateMachineId:stateMachine.context.contextId, properties: {} });
            console.log(JSON.stringify(stateMachine.context, null, 2));
    
            await engine.dispatchEvent({ eventId: 'event3', stateMachineId:stateMachine.context.contextId, properties: {} });
            console.log(JSON.stringify(stateMachine.context, null, 2));
    
            await engine.pauseStateMachine(stateMachine.context.contextId);
            console.log(JSON.stringify(stateMachine.context, null, 2));
        }
        await engine.removeStateMachine(stateMachine.context.contextId);
    });
})
