import { StateMachineEngine } from '../src/state-machine-engine';
import { readFileSync } from 'fs';
import path from 'path';

test('StateMachineEngine.createInstance', async () => {
    const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();

    const engine = new StateMachineEngine();
    const { instanceId, instance } = await engine.createInstance(doc, true);

    for (let i = 0; i < 5; i++) {
        await engine.runInstance(instanceId);
        await engine.dispatchEvent(instanceId, { eventId: 'event1', properties: {} });
        await engine.dispatchEvent(instanceId, { eventId: 'event3', properties: {} });
        await engine.stopInstance(instanceId);
        console.log(JSON.stringify(instance.context, null, 2));
    }
});