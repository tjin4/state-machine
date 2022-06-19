import { StateMachineEngine } from '../src/state-machine-engine';
import { ActivityReturnEvent } from './activity-return-event';
import { readFileSync } from 'fs';
import path from 'path';

test('StateMachineEngine.run', async () => {


    const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();

    const engine = new StateMachineEngine();
    engine.broker.register(new ActivityReturnEvent());

    const stateMachine = await engine.createStateMachine(doc, true);

    for (let i = 0; i < 1; i++) {
        await engine.runStateMachine(stateMachine.context.contextId);
        await engine.dispatchEvent(stateMachine.context.contextId, { eventId: 'event1', properties: {} });
        await engine.dispatchEvent(stateMachine.context.contextId, { eventId: 'event3', properties: {} });
        await engine.stopStateMachine(stateMachine.context.contextId);
        console.log(JSON.stringify(stateMachine.context, null, 2));
    }
});