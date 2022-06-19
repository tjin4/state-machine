export interface IEvent {
    eventId: string; //event type/name, change to eventName or eventType?
    properties: { [name: string]: any };
}

export enum EXEC_STATUS {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    STOPPED = 'STOPPED'
}

export interface IContext {
    contextId: string;

    getProperties(): Promise<Record<string, any>>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;   

    destroy(): Promise<void>;
}

/**
 * Represent a context local to the current state
 */
export interface IStateContext extends IContext {

}

/**
 * Represent a context of the current state machine instance, accessible to all states
 */
export interface IStateMachineContext extends IContext{
   
    stateId(): string | undefined; //cached stateId
    getStateId(): Promise<string | undefined>;
    setStateId(stateId?: string): Promise<void>;
   
    getExecStatus(): Promise<EXEC_STATUS>;
    setExecStatus(execStatus: EXEC_STATUS): Promise<void>;

    currentStateContext() : Promise<IContext | undefined>;
}

export interface IActivityDefinition {
    activityId: string;
    name?: string;
    description?: string;
    config?: {[key:string]: any};
}

export interface IStateDefinition {
    stateId: string;
    description?: string;   
    entryActivity?: IActivityDefinition;
    exitActivity?: IActivityDefinition;
}

export interface IStateMachineDefinition {
    definitionId: string;
    description?: string;
    initStateId: string;
    states: Record<string, IStateDefinition>;
    stateTransitions: Record<string, Record<string, string>>;
}

export interface IActivity {
    activityId: string;
    execute (activityDef: IActivityDefinition, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined>;
}