import { IEvent } from "./types";

export class ActivityDefinition {
    activityId: string = '';
    name?: string;
    description?: string;
    config: {[key:string]: any} = {};
}

export class StateDefinition {
    stateId: string = '';
    description?: string;   
    entryActivity?: ActivityDefinition;
    exitActivity?: ActivityDefinition;
}

export interface IStateMachineDefinition {
    definitionId: string;
    description?: string;
    initStateId: string;
    states: Record<string, StateDefinition>;
    stateTransitions: Record<string, Record<string, string>>;
}

/**
 * 
 */
export class StateMachineDefinition {

    doc?: IStateMachineDefinition;

    public load(docString: string) {
        const doc = JSON.parse(docString);
        if(!doc){
            throw new Error(`error parsing json doc`);
        }

        StateMachineDefinition.validateDoc(doc);
        this.doc = doc;
    }

    public static validateDoc(doc: any){
        //use json schema validator?
    }

    public getDefinitionId(): string {
        if(!this.doc){
            throw new Error('StateMachineDefinition is not loaded');
        }
        return this.doc.definitionId;
    }

    public getInitStateId(): string {
        if(!this.doc){
            throw new Error('StateMachineDefinition is not loaded');
        }

        return this.doc.initStateId;
    }

    public getStateDefinition(stateId: string): StateDefinition {
        if(!this.doc){
            throw new Error('StateMachineDefinition is not loaded');
        }
        return this.doc.states[stateId];
    }

    public nextStateId(stateId: string, eventId: string): string | undefined {
        if(!this.doc){
            throw new Error('StateMachineDefinition is not loaded');
        }

        let nextStateId: string | undefined = undefined;
        const curr = this.doc.stateTransitions[stateId];
        if (curr) {
            nextStateId = curr[eventId];
        }
        return nextStateId;
    }

}