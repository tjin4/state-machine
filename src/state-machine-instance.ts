import { IEvent, IStateContext } from "./types";
import { StateMachineDefinition, StateDefinition, ActivityDefinition } from "./state-machine-definition";
import { ActivityBroker } from './activity-broker';
import uuid from 'uuid';

class StateContext implements IStateContext {
    stateId: string | undefined;
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
        if(this.currentState.stateId === undefined){
            throw new Error(`current state context is not initialized, state-machine-instance: ${this.instanceId}`);
        }

        const nextStateId = this.stateMachineDef.nextStateId(this.currentState.stateId, event.eventId);

        if (nextStateId === undefined) {
            return;
        }

        this.enterState(nextStateId, event);
    }

    private enterState(stateId: string, event: IEvent) {
        this.currentState.stateId = stateId;
        const stateDef = this.stateMachineDef.getStateDefinition(stateId);
        if(stateDef.EntryActivity){
            this.activityBroker.executeActivity(stateDef.EntryActivity, this.currentState, event);
        }
    }
}
