export interface IEvent {
    eventId: string; //event type/name, change to eventName or eventType?
    properties: { [name: string]: any };
}


export enum EXEC_STATUS {
    RUNNING,
    PAUSED,
    STOPPED
}

export interface IStateContext {

    instanceId?: string; //in-memory cached instanceId, immutable

    getProperties(): Promise<Record<string, any>>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;

    getInstanceId(): Promise<string | undefined>;
    setInstanceId(stateId: string): Promise<void>;
    
    getStateId(): Promise<string | undefined>;
    setStateId(stateId: string): Promise<void>;
   
    getExecStatus(): Promise<EXEC_STATUS>;
    setExecStatus(execStatus: EXEC_STATUS): Promise<void>;
}

