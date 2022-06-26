import { IEvent, IStateMachineDefinition, IStateDefinition } from "./types";

/**
 * 
 */
export class StateMachineDefinition {

    doc: IStateMachineDefinition;

    constructor(doc: IStateMachineDefinition){
        this.doc = doc;
        this.validateDoc(doc);
    }

    public static loadFromString(docString: string) {
        const doc = JSON.parse(docString);
        if(!doc){
            throw new Error(`error parsing json doc`);
        }

        return new StateMachineDefinition(doc);
    }

    protected validateDoc(doc: any){
        //use json schema validator?
    }

    public getDefinitionId(): string {
        return this.doc.definitionId;
    }

    public getInitStateId(): string {
        return this.doc.initStateId;
    }

    public getStateDefinition(stateId: string): IStateDefinition {
        return this.doc.states[stateId];
    }

    public nextStateId(stateId: string, eventId: string): string | undefined {
        let nextStateId: string | undefined = undefined;
        const curr = this.doc.stateTransitions[stateId];
        if (curr) {
            nextStateId = curr[eventId];
        }
        return nextStateId;
    }

}