import { IEvent, IStateContext } from "./types";
import { ActivityDefinition } from "./state-machine-definition";

export class ActivityBroker {

    async executeActivity(activity: ActivityDefinition, stateContext: IStateContext, event?: IEvent): Promise<any> {
        console.log(`executing activity - ${JSON.stringify(activity)}`);
    }

}