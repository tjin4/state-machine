export interface IEvent {
    eventId: string;
    properties: { [name: string]: string };
}


export interface IStateContext {

    stateId: string | undefined;
    properties: { [key: string]: any };
    
}

