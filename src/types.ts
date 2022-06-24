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

    get(name: string): Promise<any>;
    set(name: string, value: any): Promise<void>;

    /**
     * persist dirty properities in getProperties() dictionary
     */
    flush(): Promise<void>;

    reset(): Promise<void>;

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

export type ExpressionEvalMode = 'sync' | 'async';

/**
 * represent a configured instance of activity
 */
export interface IActivity {
    activityId: string; //activity definition id
    description?: string;

    /**
     * input property expression must resolve to a single value that will be 
     * assigned to the input property in IActivityContext.
 
    * 'state', 'local' and 'event' can be used in expression to 
     * synchrously get values from stateMachineContext, stateContext (local), 
     * and event.
     * examples:
     * "`https://${state['host']}:${state['port']}/${local['uri']}`"
     * "{id:state['id], name:state['name']}"
     * 
     * The above approach implies we have to prefetch all properties from 
     * the stateMachineContext and stateContext before evaluating the expression. 
     * A more effient way is using the stateMachineContext directly to access
     * properties lazily, through the async get().
     * examples:
     * "`https://${await state.get('host')}:${await state.get('port')}/${await local.get('uri')}`"
     * "{id: await state.get('id'), name: await state.get('name')}"
     * 
     */
    inputPropertiesExpression?: Record<string, string>;
    inputPropertiesExpressionEvalMode?: ExpressionEvalMode; // undefined default to 'async'

    /**
     * output property expression should specify the property name in stateMachineContext/stateLoalContext.
     * The value of the output activity property will be copied to the stateMachineContext/stateLocalContext
     * 
     * examples:
     * state.url, state['url']
     * local.port, local['port']
     */
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

export interface IActivityPropertyManifest {
    name: string;
    description?: string;
    isOptional?: boolean;
}

/**
 * represent an activity meta data
 */
export interface IActivityManifest {
    activityId: string;
    name?: string;
    description?: string;

    allowedInputPropertiesExpressionEvalMode?: ExpressionEvalMode; // undefined default to 'both'
    inputProperties?: IActivityPropertyManifest[];
    outputProperties?: IActivityPropertyManifest[];
}

export interface IActivityProvider {
    readonly supportedActivities: IActivityManifest[];
    executeActivity(activity: IActivity, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}

export interface IActivityBroker {

    register(provider: IActivityProvider): Promise<boolean>;

    executeActivity(activity: IActivity, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}