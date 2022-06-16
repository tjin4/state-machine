import { IEvent, IStateContext } from "./types";
import { ActivityDefinition } from "./state-machine-definition";

export class ActivityBroker {

    async executeActivity(activity: ActivityDefinition, event: IEvent, stateContext: IStateContext): Promise<any> {

    }

}