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

export class StateMachineDefinition {
    private definitionId?: string;
    private description?: string;
    private initStateId?: string;
    private states: { [stateId: string]: StateDefinition } = {};
    private stateTransitionTable: { [stateId: string]: { [eventId: string]: string } } = {};

    public load(docString: string) {
        const doc = JSON.parse(docString);
        if(!doc){
            throw new Error(`error parsing json doc`);
        }
        this.definitionId = doc['definitionId'];
        this.description = doc['description'];
        this.initStateId = doc['initStateId'];
        
        // transform doc.states (State[]) to dictionary (Record<string, State>)

        // transform doc.stateTransitions (array) to dictionary (Record<string, Record<IEvent, string>>)
    }

    // public stringify() : string{
    //     return JSON.stringify(this);
    // }

    public getDefinitionId(): string {
        if(!this.definitionId){
            throw new Error('StateMachineDefinition is not loaded or missing definition id');
        }
        return this.definitionId;
    }

    public getInitStateId(): string {
        if(!this.initStateId){
            throw new Error('StateMachineDefinition is not loaded');
        }

        return this.initStateId;
    }

    public getStateDefinition(stateId: string): StateDefinition {
        return this.states[stateId];
    }

    public nextStateId(stateId: string, eventId: string): string | undefined {
        let nextStateId: string | undefined = undefined;
        const curr = this.stateTransitionTable[stateId];
        if (curr) {
            nextStateId = curr[eventId];
        }
        return nextStateId;
    }

}