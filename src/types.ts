export interface IEvent {
    eventId: string; //event type/name, change to eventName or eventType?
    stateMachineId: string;
    properties: { [name: string]: any };
}

export enum EXEC_STATUS {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    STOPPED = 'STOPPED'
}

export interface IContext {
    readonly contextId: string;

    getProperties(): Promise<Record<string, any>>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;   

    destroy(): Promise<void>;
}

/**
 * Represent a context local to the current state
 */
export interface IStateContext extends IContext {
    readonly stateMachineContextId: string;
    readonly stateId: string;
}

/**
 * Represent a context of the current state machine instance, accessible to all states
 */
export interface IStateMachineContext extends IContext{
    
    readonly stateMachineDefId: string;

    /**
     * synchrously return cached stateId, this is not exposed as property because it needs 
     * to set internally, but readonly for external
     */
    stateId(): string | undefined; 

    getStateId(): Promise<string | undefined>;
    setStateId(stateId?: string): Promise<void>;
   
    getExecStatus(): Promise<EXEC_STATUS>;
    setExecStatus(execStatus: EXEC_STATUS): Promise<void>;

    currentStateContext() : Promise<IStateContext | undefined>;
}

export interface IActivity {
    activityId: string;
    name?: string;
    description?: string;
    config?: {[key:string]: any};
}

export interface IStateDefinition {
    stateId: string;
    description?: string;   
    entryActivity?: IActivity;
    exitActivity?: IActivity;
}

export interface IStateMachineDefinition {
    definitionId: string;
    description?: string;
    initStateId: string;
    states: Record<string, IStateDefinition>;
    stateTransitions: Record<string, Record<string, string>>;
}

export interface IActivityProvider {
    readonly supportedActivities : string[];
    executeActivity(activity: IActivity, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}

export interface IActivityBroker {
    
    register(provider: IActivityProvider): Promise<boolean> ;

    executeActivity(activity: IActivity, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}