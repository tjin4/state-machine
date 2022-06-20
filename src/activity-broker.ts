import { IEvent, IStateMachineContext, IActivity, IActivityProvider, IActivityBroker } from "./types";

export class ActivityBroker implements IActivityBroker {

    private activitieProviders: Record<string, IActivityProvider> = {};

    async register(activityProvider: IActivityProvider): Promise<boolean> {
        activityProvider.supportedActivities.forEach(activityId => {
            this.activitieProviders[activityId] = activityProvider;
        });
        return true;
    }

    /**
     * If entry activity returns a IEvent, it will be used to drive to next state
     * @param activity 
     * @param stateContext 
     * @param event 
     */
    async executeActivity(activity: IActivity, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        const activityProvider = this.activitieProviders[activity.activityId];
        if (activityProvider !== undefined) {
            console.log(`executing activity - ${JSON.stringify(activity)}`);
            return await activityProvider.executeActivity(activity, stateContext, event);
        }
        else {
            console.log(`no activity provider registered for '${activity.activityId}'`);
        }
    }
}