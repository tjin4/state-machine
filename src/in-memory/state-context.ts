import { IStateContext } from "../types";
import { InMemoryContext } from "./context";
import { v4 as uuidv4 } from 'uuid';

export class InMemoryStateContext extends InMemoryContext implements IStateContext {

    readonly stateMachineContextId: string;
    readonly stateId: string;

    protected constructor(stateMachineContextId: string, stateId: string, contextId: string) {
        super(contextId);
        this.stateMachineContextId = stateMachineContextId;
        this.stateId = stateId;
    }

    async init(): Promise<void> {
        await super.init();
        await this.set('stateMachineContextId', this.stateMachineContextId);
        await this.set('stateId', this.stateId);
    }

    static async createStateConext(stateMachineContextId: string, stateId: string): Promise<IStateContext> {
        const contextId = `${stateMachineContextId}:${stateId}:${uuidv4()}`;
        const context = new InMemoryStateContext(stateMachineContextId, stateId, contextId);
        await context.init();
        return context;
    }

}
