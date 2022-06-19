import { EXEC_STATUS, IContext, IStateMachineContext } from "./types";
import { InMemoryContext } from "./inmemory-context";
import { v4 as uuidv4 } from 'uuid';

export class InMemoryStateMachineContext extends InMemoryContext implements IStateMachineContext {

    constructor(contextId: string) {
        super(contextId);
    }

    static async create(contextId?: string): Promise<IStateMachineContext> {
        if (contextId === undefined) {
            contextId = uuidv4();
        }
        const context = new InMemoryStateMachineContext(contextId);
        await context.set('contextId', contextId);
        return context;
    }

    static async load(instanceId: string): Promise<IStateMachineContext> {
        throw new Error('Not implemented');
    }

    async getStateId(): Promise<string | undefined> {
        return await this.get('stateId');
    }

    async setStateId(stateId?: string): Promise<void> {
        await this.set('stateId', stateId);
    }

    async getExecStatus(): Promise<EXEC_STATUS> {
        return await this.get('execStatus');
    }

    async setExecStatus(execStatus: EXEC_STATUS): Promise<void> {
        await this.set('execStatus', execStatus);
    }

    currentStateContext(): Promise<IContext> {
        throw new Error("Method not implemented.");
    }
}