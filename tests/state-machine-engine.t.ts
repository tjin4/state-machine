import { StateMachineEngine } from '../src/state-machine-engine';
import { TestActivityProvider } from './test-activity-provider';
import { readFileSync } from 'fs';
import path from 'path';
import { StateMachine } from '../src/state-machine';
import { PgContext } from '../src/db/pg-context';

function testFunctionConstructor(stateMachine: StateMachine): any{
    const str = "{return {id: stateMachine.context.stateId()}  ;}";
    let func = Function('stateMachine', str);
    const src = func.toString();
    let ret = func(stateMachine);
    return ret;
}

async function testAsyncFunctionConstructor(stateMachine: StateMachine): Promise<any>{
    // const str = "{return new Promise((resolve, reject)=>{resolve (stateMachine.context.stateId())})   ;}"; //ES2016 and prior
    const str =  "{return {id: await stateMachine.context.get('stateId')} } "; //"{return await stateMachine.context.get('stateId')  ;}"; //ESNEXT

    let AsyncFunc = Object.getPrototypeOf(async function(){}).constructor;
    let func = new AsyncFunc('stateMachine', str);
    let src = func.toString();
    let ret = await func(stateMachine);
    return ret;
}

afterAll(async ()=>{
    await PgContext.endPgPool();
})

test('StateMachineEngine.run', async () => {
 
    const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();

    const engine = new StateMachineEngine();
    engine.broker.register(new TestActivityProvider());

    const stateMachine = await engine.createStateMachine(doc, {user: 'tao'}, true);
    // await testAsyncFunctionConstructor(stateMachine);

    for (let i = 0; i < 1; i++) {
        await engine.runStateMachine(stateMachine.context.contextId);
        await engine.dispatchEvent({ eventId: 'event1', stateMachineId:stateMachine.context.contextId, properties: {} });
        await engine.dispatchEvent({ eventId: 'event3', stateMachineId:stateMachine.context.contextId, properties: {} });
        await engine.stopStateMachine(stateMachine.context.contextId);
        console.log(JSON.stringify(stateMachine.context, null, 2));
    }
    await engine.removeStateMachine(stateMachine.context.contextId);
});