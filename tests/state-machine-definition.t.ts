import { StateMachineDefinition } from '../src/state-machine-definition';

test ('StateMachineDefinition.load', ()=>{
    let def = new StateMachineDefinition();
    def.load('');
});