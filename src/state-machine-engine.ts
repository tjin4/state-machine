import { IEvent } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { StateMachine } from "./state-machine";
import { StateMachineContextFactory } from "./state-machine-context-factory";
import { ActivityBroker } from "./activity-broker";

export class StateMachineEngine {

    broker: ActivityBroker;
    private stateMachines: Record<string, StateMachine> = {};

    constructor() {
        this.broker = new ActivityBroker();
    }

    async createStateMachine(stateMachineDefDoc: string, autoStart: boolean): Promise<StateMachine> {

        const def = new StateMachineDefinition();
        def.load(stateMachineDefDoc);
        if(!def.doc){
            throw new Error('StateMachineDefinition is invalid');
        }

        const context = await StateMachineContextFactory.createStateMachineContext(def.doc.definitionId);
        const stateMachine = new StateMachine(def, this.broker, context);
        this.stateMachines[context.contextId] = stateMachine;

        if (autoStart) {
            await stateMachine.run();
        }

        return stateMachine;
    }

    findStateMachine(contextId: string): StateMachine | undefined {
        return this.stateMachines[contextId];
    }

    async runStateMachine(contextId: string) {
        await this.findStateMachine(contextId)?.run();
    }

    async pauseStateMachine(contextId: string) {
        await this.findStateMachine(contextId)?.pause();
    }

    async stopStateMachine(contextId: string) {
        await this.findStateMachine(contextId)?.stop();
    }

    async dispatchEvent(contextId: string, event: IEvent): Promise<boolean | undefined> {
        return await this.findStateMachine(contextId)?.processEvent(event);
    }

}