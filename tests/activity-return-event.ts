import { IEvent, IActivity, IActivityDefinition, IStateMachineContext } from "../src/types";

export class ActivityReturnEvent implements IActivity{
    
    activityId: string = 'activity-return-event';

    async execute(activityDef: IActivityDefinition, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        let retEvt = activityDef.config?.['event'];

        return retEvt;
    }

}