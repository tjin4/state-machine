import { EXEC_STATUS, IContext, IStateContext, IStateMachineContext, CONTEXT_TYPE } from "./types";
import { Context } from "./context";
import { PgContextManager } from "./db/pg-context";
import { StateContext } from "./state-context";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";

export class StateMachineContext extends Context implements IStateMachineContext {

    readonly stateMachineDefId: string;

    private _stateId?: string;
    private stateContext?: IStateContext;

    protected constructor(stateMachineDefId: string, contextId: string, persistContext?: IContext) {
        super(contextId, CONTEXT_TYPE.STATE_MACHINE, '', persistContext);
        this.stateMachineDefId = stateMachineDefId;
    }

    static async createStateMachineContext(stateMachineDefId: string, contextId?: string): Promise<IStateMachineContext> {
        if( contextId === undefined){
            contextId = `${CONTEXT_TYPE.STATE_MACHINE}:${stateMachineDefId}:${uuidv4()}`;
        }

        let pgContext: IContext | undefined = undefined;
        if(config.PersistContext){
            pgContext = await PgContextManager.instance.createContext(contextId, CONTEXT_TYPE.STATE_MACHINE, '');
        }

        const context = new StateMachineContext(stateMachineDefId, contextId, pgContext);
        const initImmutableProps = {
            stateMachineDefId: stateMachineDefId,
        };
        await context.init(initImmutableProps);
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

    async destroy(): Promise<void> {
        if (this.stateContext) {
            this.stateContext.destroy();
            this.stateContext = undefined;
        }
        await super.destroy();
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