import { IEvent, IActivityProvider, IActivity, IStateMachineContext, IActivityDefinition } from "../src/types";

export class TestActivityProvider implements IActivityProvider {
    readonly supportedActivities: IActivityDefinition[] = [
        {
            activityId: 'test-activity:return-event'
        }
    ];

    executeActivity(activity: IActivity, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {
        // if (activity.activityId === 'test-activity:return-event') {
        // }
        let retEvt = activity.config?.['event'];
        return retEvt;
    }
}