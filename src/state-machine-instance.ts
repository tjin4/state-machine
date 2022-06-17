import { IEvent, IStateContext } from "./types";
import { InMemoryStateContext } from "./InMemoryStateContext";
import { StateMachineDefinition, StateDefinition, ActivityDefinition } from "./state-machine-definition";
import { ActivityBroker } from './activity-broker';
import uuid from 'uuid';

export class StateMachineInstance {

    private activityBroker: ActivityBroker;

    private stateMachineDef: StateMachineDefinition;

    public context?: IStateContext;

    constructor(stateMachineDef: StateMachineDefinition, activityBroker: ActivityBroker) {
        this.stateMachineDef = stateMachineDef;
        this.activityBroker = activityBroker;
    }

    public async start(context?: IStateContext){
        if(context !== undefined){
            const instanceId = await context.getInstanceId();
            if( instanceId === undefined){
                throw new Error(`invalid context`);
            }
            this.context = context;
        }
        else{
            this.context = new InMemoryStateContext();
            await this.context.setInstanceId(uuid.v4());
        }

        const stateId = await this.context.getStateId();
        if( stateId === undefined){
            await this.enterState(this.stateMachineDef.getInitStateId());
        }
    }

    public async processEvent(event: IEvent): Promise<boolean> {
        if(!this.context){
            throw new Error(`current state context is not initialized`);
        }

        const stateId = await this.context.getStateId();
        if(!stateId){
            throw new Error(`current state context is not initialized`);
        }

        const nextStateId = this.stateMachineDef.nextStateId(stateId, event.eventId);

        if (nextStateId === undefined) {
            console.log(`no state transition path defined, event ignored`);
            return false;
        }

        await this.enterState(nextStateId, event);
        return true;
    }

    private async enterState(stateId: string, event?: IEvent) {
        if(!this.context){
            throw new Error(`current state context is not initialized`);
        }

        //leave previous state
        const prevStateId = await this.context.getStateId();
        if( prevStateId !== undefined){
            const stateDef = this.stateMachineDef.getStateDefinition(prevStateId);
            if(stateDef.exitActivity){
                await this.activityBroker.executeActivity(stateDef.exitActivity, this.context, event);
            }
        }

        //enter new state
        const stateDef = this.stateMachineDef.getStateDefinition(stateId);
        await this.context.setStateId(stateId);
        if(stateDef.entryActivity){
            await this.activityBroker.executeActivity(stateDef.entryActivity, this.context, event);
        }
    }

}
