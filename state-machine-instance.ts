import { IEvent, IStateContext } from "./types";
import { StateMachineDefinition, StateDefinition, ActivityDefinition } from "./state-machine-definition";
import { ActivityBroker } from './activity-broker';
import uuid from 'uuid';

class StateContext implements IStateContext {
    stateId: string;
    properties: { [key: string]: any } = {};
}

export class StateMachineInstance {

    public instanceId: string;

    private activityBroker: ActivityBroker;

    private stateMachineDef: StateMachineDefinition;

    private currentState: IStateContext = new StateContext();

    constructor(stateMachineDef: StateMachineDefinition, activityBroker: ActivityBroker) {
        this.stateMachineDef = stateMachineDef;
        this.activityBroker = activityBroker;
        this.instanceId = uuid.v4();
    }

    public processEvent(event: IEvent) {
        const nextStateId = this.stateMachineDef.nextStateId(this.currentState.stateId, event.eventId);
        
        if(nextStateId === undefined){
            return;
        }

        this.currentState.stateId = nextStateId;
        const stateDef = this.stateMachineDef.getStateDefinition(nextStateId);
        this.activityBroker.executeActivity(stateDef.EntryActivity, event, this.currentState); 
    }

}
