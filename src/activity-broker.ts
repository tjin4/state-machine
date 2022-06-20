import { IEvent, IStateMachineContext, IActivityDefinition, IActivityProvider, IActivityBroker } from "./types";

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
     * @param activityDef 
     * @param stateContext 
     * @param event 
     */
    async executeActivity(activityDef: IActivityDefinition, stateContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        const activityProvider = this.activitieProviders[activityDef.activityId];
        if (activityProvider !== undefined) {
            console.log(`executing activity - ${JSON.stringify(activityDef)}`);
            return await activityProvider.executeActivity(activityDef, stateContext, event);
        }
        else {
            console.log(`no activity provider registered for '${activityDef.activityId}'`);
        }
    }
}