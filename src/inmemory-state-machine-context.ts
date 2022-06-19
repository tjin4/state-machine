import { EXEC_STATUS, IContext, IStateContext, IStateMachineContext } from "./types";
import { InMemoryContext } from "./inmemory-context";
import { InMemoryStateContext } from "./inmemory-state-context";
import { v4 as uuidv4 } from 'uuid';

export class InMemoryStateMachineContext extends InMemoryContext implements IStateMachineContext {

    stateMachineDefId: string;
    stateContext?: IStateContext;

    protected constructor(stateMachineDefId: string, contextId: string) {
        super(contextId);
        this.stateMachineDefId = stateMachineDefId;
    }

    static async createStateMachineContext(stateMachineDefId: string): Promise<IStateMachineContext> {
        const contextId = `state-machine:${stateMachineDefId}:${uuidv4()}`;
        const context = new InMemoryStateMachineContext(stateMachineDefId, contextId);
        await context.set('contextId', contextId);
        await context.set('stateMachineDefId', stateMachineDefId);
        return context;
    }

    static async load(instanceId: string): Promise<IStateMachineContext> {
        throw new Error('Not implemented');
    }

    async getStateId(): Promise<string | undefined> {
        return await this.get('stateId');
    }

    async setStateId(stateId?: string): Promise<void> {
        const currStateId = await this.getStateId();
        if(currStateId === stateId){
            return;
        }
        await this.set('stateId', stateId);
        await this.setStateContext(stateId);
    }

    async getExecStatus(): Promise<EXEC_STATUS> {
        return await this.get('execStatus');
    }

    async setExecStatus(execStatus: EXEC_STATUS): Promise<void> {
        await this.set('execStatus', execStatus);
    }

    async currentStateContext(): Promise<IStateContext | undefined> {
        return this.stateContext;
    }

    private async setStateContext(stateId?: string): Promise<IStateContext | undefined> {
        if (this.stateContext) {
            this.stateContext.destroy();
            this.stateContext = undefined;
        }
        if (stateId) {
            this.stateContext = await InMemoryStateContext.createStateConext(this.stateMachineDefId, stateId);
            return this.stateContext;
        }
    }
}