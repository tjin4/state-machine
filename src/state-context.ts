import { IStateContext, IContext } from "./types";
import { Context } from "./context";
import { PgContext } from "./db/pg-context";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";

export class StateContext extends Context implements IStateContext {

    readonly stateMachineContextId: string;
    readonly stateId: string;

    protected constructor(stateMachineContextId: string, stateId: string, contextId: string, persistContext?: IContext) {
        super(contextId, persistContext);
        this.stateMachineContextId = stateMachineContextId;
        this.stateId = stateId;
    }

    protected async init(): Promise<void> {
        await super.init();
        await this.set('stateMachineContextId', this.stateMachineContextId);
        await this.set('stateId', this.stateId);
        this.immutableProps['stateMachineContextId'] = true;
        this.immutableProps['stateId'] = true;
    }

    static async createStateConext(stateMachineContextId: string, stateId: string, contextId?: string): Promise<IStateContext> {
        if(contextId === undefined){
            contextId = `${stateMachineContextId}:${stateId}:${uuidv4()}`;
        }

        let pgContext: IContext | undefined = undefined;
        if(config.PersistContext){
            pgContext = await PgContext.createContext(contextId);
        }

        const context = new StateContext(stateMachineContextId, stateId, contextId, pgContext);
        await context.init();
        return context;
    }

}
