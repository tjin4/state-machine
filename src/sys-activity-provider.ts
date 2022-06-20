import { IActivityProvider, IActivity, IEvent, IStateMachineContext } from "./types";
import { StateMachineEngine } from './state-machine-engine'

export class SysActivityProvider implements IActivityProvider {
   
    readonly supportedActivities: string[] = [
        'sys-activity:create-state-machine',
        'sys-activity:run-state-machine',
        'sys-activity:stop-state-machine',
        'sys-activity:pause-state-machine'
    ];

    private engine: StateMachineEngine;

    constructor(engine: StateMachineEngine) {
        this.engine = engine;
    }

    async executeActivity(activity: IActivity, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        switch(activity.activityId){
            case 'sys-activity:create-state-machine':{
                const defDoc: string = await event?.properties['state-machine-definition'];
                if (defDoc === undefined) {
                    return { eventId: 'sys-event.failure', stateMachineId: stateMachineContext.contextId, properties: { "info": "missing state-machine-definition" } };
                }
                const stateMachine = this.engine.createStateMachine(defDoc, false);
                (await stateMachineContext.currentStateContext())?.set('new-state-machine-id', (await stateMachine).context.contextId);
                break;
            }
            case 'sys-activity:run-state-machine':{

                break;
            }
            case 'sys-activity:stop-state-machine':{

                break;
            }
            case 'sys-activity:pause-state-machine':{

                break;
            }
            default:
                break;
        }
    }


}
