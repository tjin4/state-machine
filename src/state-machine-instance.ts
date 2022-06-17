import { EXEC_STATUS, IEvent, IStateContext } from "./types";
import { StateMachineDefinition, StateDefinition, ActivityDefinition } from "./state-machine-definition";
import { ActivityBroker } from './activity-broker';


export class StateMachineInstance {

    private activityBroker: ActivityBroker;

    private stateMachineDef: StateMachineDefinition;

    public context: IStateContext;

    constructor(stateMachineDef: StateMachineDefinition, activityBroker: ActivityBroker, context: IStateContext) {
        this.stateMachineDef = stateMachineDef;
        this.activityBroker = activityBroker;
        this.context = context;
    }

    public async start(){
        const instanceId = await this.context.getInstanceId();
        if( instanceId === undefined){
            throw new Error(`invalid context, instanceId not available`);
        }

        await this.context.setExecStatus(EXEC_STATUS.RUNNING);

        const stateId = await this.context.getStateId();
        if( stateId === undefined){
            await this.enterState(this.stateMachineDef.getInitStateId());
        }
    }

    public async pause() {
        await this.context.setExecStatus(EXEC_STATUS.PAUSED);
    }

    public async stop() {
        await this.context.setExecStatus(EXEC_STATUS.STOPPED);
    }

    public async processEvent(event: IEvent): Promise<boolean> {
        const execStatus = await this.context.getExecStatus();
        if(execStatus !== EXEC_STATUS.RUNNING){
            console.log(`state-machine-instance is not in running status, ignore event`);
            return false;
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
        const prevStateId = await this.context.getStateId();

        console.log(`${prevStateId} ==> ${stateId}, eventId:${event?.eventId}, instanceId:${this.context.instanceId}`);

        //leave previous state
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
