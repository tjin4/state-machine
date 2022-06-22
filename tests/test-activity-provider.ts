import { IEvent, IActivityProvider, IActivity, IActivityContext, IStateMachineContext, IActivityManifest } from "../src/types";

export class TestActivityProvider implements IActivityProvider {
    readonly supportedActivities: IActivityManifest[] = [
        {
            activityId: 'test-activity:return-event',
            inputProperties: [
                {
                    name: 'event',
                    description: 'event to be returned',
                    isOptional: false
                }
            ],
            outputProperties: [
                {
                    name: 'output-prop1',
                    description: '',
                    isOptional: true
                }
            ]
        }
    ];

    async executeActivity(activity: IActivity, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {
        // if (activity.activityId === 'test-activity:return-event') {
        // }
        let retEvt = await activityContext.get('event'); //activity.config?.['event'];
        await activityContext.set('output-prop1', stateMachineContext.stateId());
        console.log(`inside test-activity:return-event, returning ${JSON.stringify(retEvt)}`);
        return retEvt;
    }
}