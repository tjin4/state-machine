
export class ActivityDefinition {
    activityId: string = '';
    name: string = '';
    description: string = '';
    config: {[key:string]: any} = {};
}

export class StateDefinition {
    stateId: string = '';
    description: string = '';
    EntryActivity: ActivityDefinition | undefined;
    // public ExitActivity: ActivityDefinition;
}

export class StateMachineDefinition {
    private states: { [stateId: string]: StateDefinition } = {};
    private stateTransitionTable: { [stateId: string]: { [eventId: string]: string } } = {};
    private initStateId: string | undefined;

    public load(doc: string) {
        throw new Error('not implemented');        
    }

    public getStateDefinition(stateId: string): StateDefinition {
        return this.states[stateId];
    }

    public getInitStateId(): string {
        if(!this.initStateId){
            throw new Error('StateMachineDefinition is not loaded');
        }

        return this.initStateId;
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