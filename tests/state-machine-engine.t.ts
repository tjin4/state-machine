import { StateMachineEngine } from '../src/state-machine-engine';
import { TestActivityProvider } from './test-activity-provider';
import { StateMachineDefinition } from '../src/state-machine-definition';
import { readFileSync } from 'fs';
import path from 'path';
import { StateMachine } from '../src/state-machine';
import { EXEC_STATUS } from '../src/types';
import { PgPool } from '../src/db/pg-pool';
import { StateMachineDefinitionRegistry } from '../src/state-machine-definition-registry';
import { ActivityBroker } from '../src/activity-broker';

describe('StateMachineEngin Tests', ()=>{

    beforeAll(async ()=>{

      
    })

    afterAll(async ()=>{
        await PgPool.destroyInstance();
    })

    beforeEach(async ()=>{
        
    })

    test('StateMachineEngine.list', async ()=>{
        const engine = new StateMachineEngine();
        const list = await engine.listStateMachineIds();
        console.log(JSON.stringify(list));
    })
    
    test.skip('StateMachineEngine.run', async () => {
        ActivityBroker.instance.register(new TestActivityProvider());

        const docString = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();
        const def = StateMachineDefinition.loadFromString(docString);
        await StateMachineDefinitionRegistry.instance.register(def);

        const engine = new StateMachineEngine();
    
        const stateMachine = await engine.createStateMachine(def.getDefinitionId(), {user: 'tao'}, true);
        const stateMachineContextId = stateMachine.context.contextId;
    
        for (let i = 0; i < 1; i++) {
            await engine.runStateMachine(stateMachineContextId);
            expect(await stateMachine.context.getExecStatus()).toEqual(EXEC_STATUS.RUNNING);
            expect(await stateMachine.context.getStateId()).toEqual('state1');
    
            await engine.dispatchEvent({ eventId: 'event1', stateMachineId:stateMachineContextId, properties: {} });
            expect(await stateMachine.context.getExecStatus()).toEqual(EXEC_STATUS.RUNNING);
            expect(await stateMachine.context.getStateId()).toEqual('state3');
    
            await engine.dispatchEvent({ eventId: 'event3', stateMachineId:stateMachineContextId, properties: {} });
            expect(await stateMachine.context.getExecStatus()).toEqual(EXEC_STATUS.RUNNING);
            expect(await stateMachine.context.getStateId()).toEqual('state1');

            
            await engine.pauseStateMachine(stateMachineContextId);
            expect(await stateMachine.context.getExecStatus()).toEqual(EXEC_STATUS.PAUSED);
            expect(await stateMachine.context.getStateId()).toEqual('state1');

        }
        await engine.removeStateMachine(stateMachineContextId);
    });
})
