import { StateMachineEngine } from '../src/state-machine-engine';
import { TestActivityProvider } from './test-activity-providert';
import { readFileSync } from 'fs';
import path from 'path';

test('StateMachineEngine.run', async () => {

    const event = {eventId: "1234", properties: {stateMachineId: 'stateMachine1'}}
    const expression = 'event.properties["stateMachineId"]';
    let id= eval(expression);

    const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();

    const engine = new StateMachineEngine();
    engine.broker.register(new TestActivityProvider());

    const stateMachine = await engine.createStateMachine(doc, true);

    for (let i = 0; i < 1; i++) {
        await engine.runStateMachine(stateMachine.context.contextId);
        await engine.dispatchEvent({ eventId: 'event1', stateMachineId:stateMachine.context.contextId, properties: {} });
        await engine.dispatchEvent({ eventId: 'event3', stateMachineId:stateMachine.context.contextId, properties: {} });
        await engine.stopStateMachine(stateMachine.context.contextId);
        console.log(JSON.stringify(stateMachine.context, null, 2));
    }
});