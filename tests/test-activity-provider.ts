import { IEvent, IActivityProvider, IActivity, IActivityContext, IStateMachineContext, IActivityDefinition } from "../src/types";

export class TestActivityProvider implements IActivityProvider {
    readonly supportedActivities: IActivityDefinition[] = [
        {
            activityId: 'test-activity:return-event',
            inputProperties: [
                {
                    name: 'event',
                    description: 'event to be returned',
                    isOptional: false
                }
            ]
        }
    ];

    async executeActivity(activity: IActivity, activityContext: IActivityContext, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {
        // if (activity.activityId === 'test-activity:return-event') {
        // }
        let retEvt = await activityContext.get('event'); //activity.config?.['event'];
        console.log(`inside test-activity:return-event, returning ${JSON.stringify(retEvt)}`);
        return retEvt;
    }
}