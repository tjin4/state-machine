import { IStateContext, IContext, CONTEXT_TYPE } from "./types";
import { Context } from "./context";
import { PgContextManager } from "./db/pg-context";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";

export class StateContext extends Context implements IStateContext {

    readonly stateMachineContextId: string;
    readonly stateId: string;

    protected constructor(stateMachineContextId: string, stateId: string, contextId: string, persistContext?: IContext) {
        super(contextId, CONTEXT_TYPE.STATE_LOCAL, '', persistContext);
        this.stateMachineContextId = stateMachineContextId;
        this.stateId = stateId;
        this.initImmutableProps['stateMachineContextId'] = stateMachineContextId;
        this.initImmutableProps['stateId'] = stateId;
    }

    static async createStateConext(stateMachineContextId: string, stateId: string, contextId?: string): Promise<IStateContext> {
        if (contextId === undefined) {
            contextId = `${CONTEXT_TYPE.STATE_LOCAL}:${stateId}:${uuidv4()}`;
        }

        let pgContext: IContext | undefined = undefined;
        if (config.PersistContext) {
            pgContext = await PgContextManager.instance.createContext(contextId, CONTEXT_TYPE.STATE_LOCAL, '');
        }

        const context = new StateContext(stateMachineContextId, stateId, contextId, pgContext);
        await context.init();
        return context;
    }

}
