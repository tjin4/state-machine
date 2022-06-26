import { IEvent, IStateMachineContext } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { StateMachine } from "./state-machine";
import { ActivityBroker } from "./activity-broker";
import { ContextManager } from "./context-manager";
import { StateMachineDefinitionRegistry } from "./state-machine-definition-registry";

export class StateMachineEngine {


    constructor() {
    }

    async createStateMachine(stateMachineDefId: string, startupArgs: any, autoStart: boolean): Promise<StateMachine> {

        const def = await StateMachineDefinitionRegistry.instance.find(stateMachineDefId);
        if(!def){
            throw new Error(`stateMachineDefId '${stateMachineDefId}' is not registered`);
        }

        const context = await ContextManager.instance.createStateMachineContext(def.getDefinitionId());
        await context.set('startupArgs', startupArgs);
        const stateMachine = new StateMachine(def, context);

        if (autoStart) {
            await stateMachine.run();
        }

        return stateMachine;
    }

    async findStateMachine(contextId: string): Promise<StateMachine | null> {
        const context = await ContextManager.instance.getContext(contextId) as IStateMachineContext;
        if (!context) {
            return null;
        }
        
        const def = await StateMachineDefinitionRegistry.instance.find(context.stateMachineDefId);
        if(!def){
            throw new Error(`stateMachineDefId '${context.stateMachineDefId}' is not registered`);
        }

        const stateMachine = new StateMachine(def, context);
        return stateMachine;
    }

    async runStateMachine(contextId: string): Promise<void> {
        await (await this.findStateMachine(contextId))?.run();
    }

    async pauseStateMachine(contextId: string): Promise<void> {
        await (await this.findStateMachine(contextId))?.pause();
    }

    async stopStateMachine(contextId: string): Promise<void> {
        await (await this.findStateMachine(contextId))?.stop();
    }

    async removeStateMachine(contextId: string): Promise<void> {
        await (await this.findStateMachine(contextId))?.destroy();
    }

    async dispatchEvent(event: IEvent): Promise<boolean | undefined> {
        return await (await this.findStateMachine(event.stateMachineId))?.processEvent(event);
    }

}