import { StateMachineDefinition } from '../src/state-machine-definition';
// import { StateMachineDefinition as StateMachineDefinitionArraytDoc } from '../src/state-machine-definition-array-doc';
import { readFileSync } from 'fs';
import path from 'path';

test('StateMachineDefinition.load', async () => {
    const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-dict-doc.json')).toString();
    let def = new StateMachineDefinition();
    def.load(doc);
    console.log(`defId=${def.getDefinitionId()}, initState=${def.getInitStateId()}`);
    
    const state1Def = def.getStateDefinition('state1');
    console.log(JSON.stringify(state1Def));

    const nextStateId = def.nextStateId('state1', 'event1');
    console.log(`state1 + event1 => ${nextStateId}`)

});

// test('StateMachineDefinitionArrayDoc.load', () => {
//     const doc = readFileSync(path.join(__dirname, 'sample-state-machine-def-array-doc.json')).toString();
//     let def = new StateMachineDefinitionArraytDoc();
//     def.load(doc);
// });