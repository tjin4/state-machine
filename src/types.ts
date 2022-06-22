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
export interface IStateMachineContext extends IContext {

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

    currentStateContext(): Promise<IStateContext | undefined>;
}

/**
 * represent a configured instance of activity
 */
export interface IActivity {
    activityId: string; //activity definition id
    description?: string;

    inputPropertiesExpression?: Record<string, string>;
    outputPropertiesExpression?: Record<string, string>;
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

export type IActivityContext = IContext;
// export interface IActivityContext extends IContext {
// }

export interface IActivityPropertyDefinition {
    name: string;
    description?: string;
    isOptional?: boolean;
}

/**
 * represent an activity meta data
 */
export interface IActivityDefinition {
    activityId: string;
    name?: string;
    description?: string;

    inputProperties?: IActivityPropertyDefinition[];
    outputProperties?: IActivityPropertyDefinition[];
}

export interface IActivityProvider {
    readonly supportedActivities: IActivityDefinition[];
    executeActivity(activity: IActivity, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}

export interface IActivityBroker {

    register(provider: IActivityProvider): Promise<boolean>;

    executeActivity(activity: IActivity, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}