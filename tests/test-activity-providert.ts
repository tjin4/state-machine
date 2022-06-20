import { IEvent, IActivityProvider, IActivityDefinition, IStateMachineContext } from "../src/types";

export class TestActivityProvider implements IActivityProvider {
    readonly supportedActivities: string[] = [
        'test-activity:return-event'
    ];

    executeActivity(activityDef: IActivityDefinition, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {
        // if (activityDef.activityId === 'test-activity:return-event') {
        // }
        let retEvt = activityDef.config?.['event'];
        return retEvt;
    }
}