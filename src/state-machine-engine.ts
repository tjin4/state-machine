import { IEvent } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { StateMachineInstance } from "./state-machine-instance";
import { StateContextFactory } from "./StateConextFactory";
import { ActivityBroker } from "./activity-broker";

export class StateMachineEngine {

    broker: ActivityBroker;
    private instances: Record<string, StateMachineInstance> = {};

    constructor() {
        this.broker = new ActivityBroker();
    }

    async createInstance(stateMachineDefDoc: string, autoStart: boolean): Promise<{ instanceId: string, instance: StateMachineInstance }> {

        const def = new StateMachineDefinition();
        def.load(stateMachineDefDoc);

        const { instanceId, context } = await StateContextFactory.createStateContext();
        const instance = new StateMachineInstance(def, this.broker, context);
        this.instances[instanceId] = instance;

        if (autoStart) {
            await instance.run();
        }

        return { instanceId, instance };
    }

    findInstance(instanceId: string): StateMachineInstance | undefined {
        return this.instances[instanceId];
    }

    async runInstance(instanceId: string) {
        await this.findInstance(instanceId)?.run();
    }

    async pauseInstance(instanceId: string) {
        await this.findInstance(instanceId)?.pause();
    }

    async stopInstance(instanceId: string) {
        await this.findInstance(instanceId)?.stop();
    }

    async dispatchEvent(instanceId: string, event: IEvent): Promise<boolean | undefined> {
        return await this.findInstance(instanceId)?.processEvent(event);
    }

}