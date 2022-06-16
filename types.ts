export interface IEvent {
    eventId: string;
    properties: { [name: string]: string };
}


export interface IStateContext {

    stateId: string;
    properties: { [key: string]: any };
    
}

