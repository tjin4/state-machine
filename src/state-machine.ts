import { EXEC_STATUS, IEvent, IStateMachineContext } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { ActivityBroker } from './activity-broker';

export class StateMachine {

    private stateMachineDef: StateMachineDefinition;

    public readonly context: IStateMachineContext;

    constructor(stateMachineDef: StateMachineDefinition, context: IStateMachineContext) {
        this.stateMachineDef = stateMachineDef;
        this.context = context;
    }

    /**
     * Set the exec_status to 'RUNNING' so it will take events. If current state is undefined, start from the init state.
     */
    public async run() {
        await this.context.setExecStatus(EXEC_STATUS.RUNNING);

        const stateId = await this.context.getStateId();
        if (stateId === undefined) {
            await this.transitToState(this.stateMachineDef.getInitStateId());
        }
    }

    /**
     * Pause the state machine from taking event, following run will resume from current state.
     */
    public async pause() {
        await this.context.setExecStatus(EXEC_STATUS.PAUSED);
    }

    /**
     * Stop the state machine and reset the state to undefined, following run will start from init state
     */
    public async stop() {
        await this.transitToState(undefined);
        await this.context.reset();
        await this.context.setExecStatus(EXEC_STATUS.STOPPED);
    }

    public async destroy() {
        await this.context.destroy();
    }

    public async processEvent(event: IEvent): Promise<boolean> {
        const execStatus = await this.context.getExecStatus();
        if (execStatus !== EXEC_STATUS.RUNNING) {
            console.log(`state-machine-instance is not in running status, ignore event`);
            return false;
        }

        const stateId = await this.context.getStateId();
        if (!stateId) {
            throw new Error(`current state context is not initialized`);
        }

        const nextStateId = this.stateMachineDef.nextStateId(stateId, event.eventId);

        if (nextStateId === undefined) {
            console.log(`no state transition path defined, event ignored, eventId=${event.eventId}`);
            return false;
        }

        let ret = await this.transitToState(nextStateId, event);
        if (ret) {
            return this.processEvent(ret);
        }
        return true;
    }

    private async transitToState(stateId?: string, event?: IEvent): Promise<IEvent | undefined> {
        const currStateId = await this.context.getStateId();

        console.log(`${currStateId} ==> ${stateId} on eventId:${event?.eventId}, (definitionId:${this.stateMachineDef.getDefinitionId()} instanceId:${this.context.contextId})`);

        //leave current state
        if (currStateId !== undefined) {
            const stateDef = this.stateMachineDef.getStateDefinition(currStateId);
            if (stateDef.exitActivity) {
                await ActivityBroker.instance.executeActivity(stateDef.exitActivity, this.context, event);
            }
        }

        //enter new state
        await this.context.setStateId(stateId);
        if (stateId !== undefined) {
            const stateDef = this.stateMachineDef.getStateDefinition(stateId);
            if (stateDef.entryActivity) {
                return await ActivityBroker.instance.executeActivity(stateDef.entryActivity, this.context, event);
            }
        }
    }
}
