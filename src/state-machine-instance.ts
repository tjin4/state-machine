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

    constructor(stateMachineDef: StateMachineDefinition, activityBroker: ActivityBroker, instanceId?: string) {
        this.stateMachineDef = stateMachineDef;
        this.activityBroker = activityBroker;
        this.instanceId = instanceId || uuid.v4();
    }

    public async start(){
        await this.enterState(this.stateMachineDef.getInitStateId());
    }

    public async processEvent(event: IEvent) {
        if(this.currentState.stateId === undefined){
            throw new Error(`current state context is not initialized, state-machine-instance: ${this.instanceId}`);
        }

        const nextStateId = this.stateMachineDef.nextStateId(this.currentState.stateId, event.eventId);

        if (nextStateId === undefined) {
            return;
        }

        await this.enterState(nextStateId, event);
    }

    private async enterState(stateId: string, event?: IEvent) {
        if(this.currentState.stateId !== undefined){
            const stateDef = this.stateMachineDef.getStateDefinition(this.currentState.stateId);
            if(stateDef.exitActivity){
                await this.activityBroker.executeActivity(stateDef.exitActivity, this.currentState, event);
            }
        }

        this.currentState.stateId = stateId;
        const stateDef = this.stateMachineDef.getStateDefinition(stateId);
        if(stateDef.entryActivity){
            await this.activityBroker.executeActivity(stateDef.entryActivity, this.currentState, event);
        }
    }

}
