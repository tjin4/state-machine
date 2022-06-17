import { IEvent } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { StateMachineInstance } from "./state-machine-instance";
import { StateContextFactory } from "./StateConextFactory";
import { ActivityBroker } from "./activity-broker";


export class StateMachineEngine {

    async createInstance(stateMachineDefDoc: string, autoStart: boolean): Promise<string> {
        const broker = new ActivityBroker();

        const def = new StateMachineDefinition();
        def.load(stateMachineDefDoc);

        const {instanceId, context} = await StateContextFactory.createStateContext();
        const instance = new StateMachineInstance(def, broker, context);
        if(autoStart){
            await instance.start();
        }

        return instanceId;
    }

    destroyInstance(instanceId: string) {

    }

    findInstance(instanceId: string): StateMachineInstance | null{
        return null;
    }

    pauseInstance(instanceId: string) {

    }

    resumeInstance(instanceId: string) {

    }

    private dispatchEvent(instanceId: string, event: IEvent){
        const instance = this.findInstance(instanceId);
        if(instance){
            instance.processEvent(event);
        }
    }

}