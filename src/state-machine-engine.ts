import { IEvent } from "./types";
import { StateMachineInstance } from "./state-machine-instance";

export class StateMachineEngine {

    createInstance(stateMachineDefDoc: string): string {
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