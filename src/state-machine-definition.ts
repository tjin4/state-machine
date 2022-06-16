
export class ActivityDefinition {
    activityId: string = '';
    name: string = '';
    description: string = '';
    config: {[key:string]: any} = {};
}

export class StateDefinition {
    stateId: string = '';
    description: string = '';
    EntryActivity?: ActivityDefinition;
    ExitActivity?: ActivityDefinition;
}

export class StateMachineDefinition {
    private definitionId?: string;
    private description?: string;
    private states: { [stateId: string]: StateDefinition } = {};
    private stateTransitionTable: { [stateId: string]: { [eventId: string]: string } } = {};
    private initStateId?: string;

    public load(doc: string) {
        throw new Error('not implemented');        
    }

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