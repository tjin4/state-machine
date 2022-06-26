import { CONTEXT_TYPE, EXEC_STATUS, IContext, IStateMachineContext, IStateContext, IActivityContext, IContextManager } from "./types";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";
import { PgContextManager } from "./db/pg-context";

export class ContextManager implements IContextManager {

    static readonly instance: ContextManager = new ContextManager();

    private contexts: Record<CONTEXT_TYPE, Record<string, IContext>> = {
        'activity': {},
        'state-local': {},
        'state-machine': {}
    };

    async getContexts(contextType: CONTEXT_TYPE): Promise<IContext[]> {
        if (config.PersistContext) {
            const baseContexts = await PgContextManager.instance.getContexts(contextType);
            const contexts = Promise.all(baseContexts.map(async (baseContext) => { return await this.createContextFromBase(baseContext, baseContext.contextType, {}); }));
            return contexts;
        }

        //
        return Object.values(this.contexts[contextType]);
    }

    async getContext(contextId: string): Promise<IContext | null> {
        if (config.PersistContext) {
            const baseContext = await PgContextManager.instance.getContext(contextId);
            if (!baseContext) {
                return null;
            }
            return this.createContextFromBase(baseContext, baseContext.contextType, {});
        }

        //
        if (this.contexts['state-machine'][contextId] !== undefined) {
            return this.contexts['state-machine'][contextId];
        }
        else if (this.contexts['state-local'][contextId] !== undefined) {
            return this.contexts['state-local'][contextId];
        }
        else if (this.contexts['activity'][contextId] !== undefined) {
            return this.contexts['activity'][contextId];
        }
        return null;
    }

    async createContext(contextId: string | undefined, contextType: CONTEXT_TYPE, description: string, initReadOnlyProps: Record<string, any>): Promise<IContext> {
        if (contextId === undefined) {
            contextId = `${contextType}:${uuidv4()}`;
        }

        let baseContext: IContext;
        if (config.PersistContext) {
            baseContext = await PgContextManager.instance.createContext(contextId, contextType, description, initReadOnlyProps);
        }
        else {
            baseContext = new InMemoryContext(contextId, contextType, description);
            baseContext.init(initReadOnlyProps);
        }

        return await this.createContextFromBase(baseContext, contextType, initReadOnlyProps);
    }

    private async createContextFromBase(baseContext: IContext, contextType: CONTEXT_TYPE, initReadOnlyProps: Record<string, any>): Promise<IContext> {

        switch (contextType) {
            case CONTEXT_TYPE.ACTIVITY: {
                const activityId = initReadOnlyProps['activityId'] ?? await baseContext.get('activityId');
                const context = new ActivityContext(baseContext, activityId);
                this.contexts[contextType][context.contextId] = context;
                return context;
            }
            case CONTEXT_TYPE.STATE_LOCAL: {
                const stateMachineContextId = initReadOnlyProps['stateMachineContextId'] ?? await baseContext.get('stateMachineContextId');
                const stateId = initReadOnlyProps['stateId'] ?? await baseContext.get('stateId');
                const context = new StateContext(baseContext, stateMachineContextId, stateId);
                this.contexts[contextType][context.contextId] = context;
                return context;
            }
            case CONTEXT_TYPE.STATE_MACHINE: {
                const stateMachineDefId = initReadOnlyProps['stateMachineDefId'] ?? await baseContext.get('stateMachineDefId');
                const context = new StateMachineContext(baseContext, stateMachineDefId);
                await context.initLoadCurrentStateContext();
                this.contexts[contextType][context.contextId] = context;
                return context;
            }
            default: {
                throw new Error(`context type not supported`);
            }
        }
    }

    async createActivityContext(activityId: string, contextId?: string): Promise<IActivityContext> {
        return await this.createContext(contextId, CONTEXT_TYPE.ACTIVITY, '', { activityId: activityId }) as IActivityContext;
    }

    async createStateContext(stateMachineContextId: string, stateId: string, contextId?: string): Promise<IStateContext> {
        return await this.createContext(contextId, CONTEXT_TYPE.STATE_LOCAL, '', { stateMachineContextId, stateId }) as IStateContext;
    }

    async createStateMachineContext(stateMachineDefId: string, contextId?: string): Promise<IStateMachineContext> {
        return await this.createContext(contextId, CONTEXT_TYPE.STATE_MACHINE, '', { stateMachineDefId }) as IStateMachineContext;
    }

    async deleteContext(contextId: string): Promise<number> {
        let ret = 0;
        if (this.contexts['state-machine'][contextId] !== undefined) {
            delete this.contexts['state-machine'][contextId];
            ret = 1;
        }
        else if (this.contexts['state-local'][contextId] !== undefined) {
            delete this.contexts['state-local'][contextId];
            ret = 1;
        }
        else if (this.contexts['activity'][contextId] !== undefined) {
            delete this.contexts['activity'][contextId];
            ret = 1;
        }

        if (config.PersistContext) {
            return await PgContextManager.instance.deleteContext(contextId);
        }

        return ret;
    }
}

export class InMemoryContext implements IContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    protected properties: { [key: string]: any } = {};

    private readOnlyPropNames: Record<string, boolean> = {};

    constructor(contextId: string, contextType: CONTEXT_TYPE, description: string) {
        this.contextId = contextId;
        this.contextType = contextType;
        this.description = description;
    }

    async init(initReadOnlyProps: Record<string, any>): Promise<void> {
        for (const name in initReadOnlyProps) {
            await this.set(name, initReadOnlyProps[name]);
            this.readOnlyPropNames[name] = true;
        }
    }

    async get(name: string): Promise<any> {
        return this.properties[name];
    }

    async set(name: string, value: any): Promise<void> {
        if (this.readOnlyPropNames[name]) {
            throw new Error(`Trying to set readonly property '${name}'`);
        }
        this.properties[name] = value;
    }

    async getProperties(): Promise<Record<string, any>> {
        return this.properties;
    }

    async reset(): Promise<void> {
        this.properties = {};
    }

    async destroy(): Promise<void> {
        this.properties = {};
    }
}

class ActivityContext implements IActivityContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    readonly activityId: string;

    private baseContext: IContext;

    constructor(baseContext: IContext, activityId: string) {
        if (baseContext.contextType !== CONTEXT_TYPE.ACTIVITY) {
            throw new Error('incorrect context type');
        }
        this.baseContext = baseContext;
        this.contextId = baseContext.contextId;
        this.contextType = baseContext.contextType;
        this.description = baseContext.description;
        this.activityId = activityId;
    }

    async init(initReadOnlyProps: Record<string, any>): Promise<void> {
        await this.baseContext.init(initReadOnlyProps);
    }
    async getProperties(): Promise<Record<string, any>> {
        return await this.baseContext.getProperties();
    }
    async get(name: string): Promise<any> {
        return await this.baseContext.get(name);
    }
    async set(name: string, value: any): Promise<void> {
        return await this.baseContext.set(name, value);
    }
    async reset(): Promise<void> {
        return await this.baseContext.reset();
    }
    async destroy(): Promise<void> {
        return await this.baseContext.destroy();
    }
}

class StateContext implements IStateContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    readonly stateMachineContextId: string;
    readonly stateId: string;

    private baseContext: IContext;

    constructor(baseContext: IContext, stateMachineContextId: string, stateId: string) {
        if (baseContext.contextType !== CONTEXT_TYPE.STATE_LOCAL) {
            throw new Error('incorrect context type');
        }
        this.baseContext = baseContext;
        this.contextId = baseContext.contextId;
        this.contextType = baseContext.contextType;
        this.description = baseContext.description;
        this.stateMachineContextId = stateMachineContextId;
        this.stateId = stateId;
    }

    async init(initReadOnlyProps: Record<string, any>): Promise<void> {
        await this.baseContext.init(initReadOnlyProps);
    }
    async getProperties(): Promise<Record<string, any>> {
        return await this.baseContext.getProperties();
    }
    async get(name: string): Promise<any> {
        return await this.baseContext.get(name);
    }
    async set(name: string, value: any): Promise<void> {
        return await this.baseContext.set(name, value);
    }
    async reset(): Promise<void> {
        return await this.baseContext.reset();
    }
    async destroy(): Promise<void> {
        return await this.baseContext.destroy();
    }
}

class StateMachineContext implements IStateMachineContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    readonly stateMachineDefId: string;

    private baseContext: IContext;

    private _stateId?: string;
    private stateContext?: IStateContext;

    constructor(baseContext: IContext, stateMachineDefId: string) {
        if (baseContext.contextType !== CONTEXT_TYPE.STATE_MACHINE) {
            throw new Error('incorrect context type');
        }
        this.baseContext = baseContext;
        this.contextId = baseContext.contextId;
        this.contextType = baseContext.contextType;
        this.description = baseContext.description;
        this.stateMachineDefId = stateMachineDefId;
    }

    async initLoadCurrentStateContext(): Promise<void> {
        const stateContextId = await this.get('stateContextId') as string;
        if (!stateContextId) {
            return;
        }
        const stateContext = await ContextManager.instance.getContext(stateContextId);
        if (!stateContext) {
            return;
        }
        if(stateContext.contextType !== CONTEXT_TYPE.STATE_LOCAL) {
            throw new Error ('Internal error, expecting state-local context type');
        }
        this.stateContext = stateContext as IStateContext;
    }

    async init(initReadOnlyProps: Record<string, any>): Promise<void> {
        await this.baseContext.init(initReadOnlyProps);
    }
    async getProperties(): Promise<Record<string, any>> {
        return await this.baseContext.getProperties();
    }
    async get(name: string): Promise<any> {
        return await this.baseContext.get(name);
    }
    async set(name: string, value: any): Promise<void> {
        return await this.baseContext.set(name, value);
    }
    async reset(): Promise<void> {
        return await this.baseContext.reset();
    }

    stateId(): string | undefined {
        return this._stateId;
    }

    async getStateId(): Promise<string | undefined> {
        this._stateId = await this.get('stateId');
        return this._stateId;
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
            await this.stateContext.destroy();
            this.stateContext = undefined;
        }
        await this.baseContext.destroy();
    }

    private async setStateContext(stateId?: string): Promise<IStateContext | undefined> {
        if (this.stateContext) {
            await this.set('stateContextId', undefined);
            await this.stateContext.destroy();
            this.stateContext = undefined;
        }
        if (stateId) {
            this.stateContext = await ContextManager.instance.createStateContext(this.contextId, stateId);
            await this.set('stateContextId', this.stateContext.contextId)
            return this.stateContext;
        }
    }
}