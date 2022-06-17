export interface IEvent {
    eventId: string; //event type/name, change to eventName or eventType?
    properties: { [name: string]: any };
}


export interface IStateContext {
    stateId: string | undefined; //change to stateName?
    properties: { [key: string]: any };
}

