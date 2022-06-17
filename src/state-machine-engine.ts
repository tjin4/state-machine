import { IEvent } from "./types";
import { StateMachineDefinition } from "./state-machine-definition";
import { StateMachineInstance } from "./state-machine-instance";
import { InMemoryStateContext } from "./InMemoryStateContext";

export class StateMachineEngine {

    createInstance(stateMachineDefDoc: string, autoStart: boolean): string {
        const instanceId = "";
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