import { IEvent, IActivity, IActivityDefinition, IStateContext } from "../src/types";

export class ActivityReturnEvent implements IActivity{
    
    activityId: string = 'activity-return-event';

    async execute(activityDef: IActivityDefinition, stateContext: IStateContext, event?: IEvent): Promise<IEvent | undefined> {

        let retEvt = activityDef.config?.['event'];

        return retEvt;
    }

}