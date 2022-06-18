import { IEvent, IStateContext, IActivityDefinition, IActivity } from "./types";

export class ActivityBroker {

    private activities: Record<string, IActivity> = {};

    register(activity: IActivity){
        this.activities[activity.activityId] = activity;
    }

    /**
     * If entry activity returns a IEvent, then will be used to drive to next state
     * @param activityDef 
     * @param stateContext 
     * @param event 
     */
    async executeActivity(activityDef: IActivityDefinition, stateContext: IStateContext, event?: IEvent): Promise<IEvent | undefined> {
        
        const activity = this.activities[activityDef.activityId];
        if(activity !== undefined){
            console.log(`executing activity - ${JSON.stringify(activityDef)}`);
            return await activity.execute(activityDef, stateContext, event);
        }
        else{
            console.log(`activity not found - ${activityDef.activityId}`);
        }
    }
}