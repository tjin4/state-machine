import { IActivityProvider, IActivity, IActivityContext, IEvent, IStateMachineContext, IActivityManifest } from "./types";
import { StateMachineEngine } from './state-machine-engine'

export class SysActivityProvider implements IActivityProvider {

    readonly supportedActivities: IActivityManifest[] = [
        {
            activityId: 'sys-activity:create-state-machine',
            inputProperties: [
                {
                    name: 'state-machine-definition'
                },
                {
                    name: 'auto-start'
                }
            ]
        },
        {
            activityId: 'sys-activity:run-state-machine',
            inputProperties: [
                {
                    name: 'state-machine-id'
                }
            ]
        },
        {
            activityId: 'sys-activity:stop-state-machine',
            inputProperties: [
                {
                    name: 'state-machine-id'
                }
            ]
        },
        {
            activityId: 'sys-activity:pause-state-machine',
            inputProperties: [
                {
                    name: 'state-machine-id'
                }
            ]
        }
    ];

    private engine: StateMachineEngine;

    constructor(engine: StateMachineEngine) {
        this.engine = engine;
    }

    async executeActivity(activity: IActivity, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        switch (activity.activityId) {
            case 'sys-activity:create-state-machine': {
                const defDoc: string = await event?.properties['state-machine-definition'];
                if (defDoc === undefined) {
                    return { eventId: 'sys-event.failure', stateMachineId: stateMachineContext.contextId, properties: { "info": "missing state-machine-definition" } };
                }
                const stateMachine = this.engine.createStateMachine(defDoc, {}, false);
                (await stateMachineContext.currentStateContext())?.set('new-state-machine-id', (await stateMachine).context.contextId);
                break;
            }
            case 'sys-activity:run-state-machine': {

                break;
            }
            case 'sys-activity:stop-state-machine': {

                break;
            }
            case 'sys-activity:pause-state-machine': {

                break;
            }
            default:
                break;
        }
    }


}
