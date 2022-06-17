export interface IEvent {
    eventId: string; //event type/name, change to eventName or eventType?
    properties: { [name: string]: any };
}


export interface IStateContext {
    getProperties(): Promise<Record<string, any>>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;

    getInstanceId(): Promise<string | undefined>;
    setInstanceId(stateId: string): Promise<void>;
    
    getStateId(): Promise<string | undefined>;
    setStateId(stateId: string): Promise<void>;
   
}

