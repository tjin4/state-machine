import { EXEC_STATUS, IContext, IStateContext, IStateMachineContext } from "./types";
import { Context } from "./context";
import { StateContext } from "./state-context";
import { v4 as uuidv4 } from 'uuid';

export class StateMachineContext extends Context implements IStateMachineContext {

    readonly stateMachineDefId: string;

    private _stateId?: string;
    private stateContext?: IStateContext;

    protected constructor(stateMachineDefId: string, contextId: string) {
        super(contextId);
        this.stateMachineDefId = stateMachineDefId;
    }

    async init(): Promise<void> {
        await super.init();
        await this.set('stateMachineDefId', this.stateMachineDefId);
    }

    static async createStateMachineContext(stateMachineDefId: string): Promise<IStateMachineContext> {
        const contextId = `state-machine:${stateMachineDefId}:${uuidv4()}`;
        const context = new StateMachineContext(stateMachineDefId, contextId);
        await context.init();
        return context;
    }

    static async load(instanceId: string): Promise<IStateMachineContext> {
        throw new Error('Not implemented');
    }

    stateId(): string | undefined {
        return this._stateId;
    }

    async getStateId(): Promise<string | undefined> {
        return await this.get('stateId');
    }

    async setStateId(stateId?: string): Promise<void> {
        const currStateId = await this.getStateId();
        if (currStateId === stateId) {
            return;
        }
        this._stateId = stateId;
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
            this.stateContext = await StateContext.createStateConext(this.stateMachineDefId, stateId);
            return this.stateContext;
        }
    }
}