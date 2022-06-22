import { IEvent, IStateMachineContext, IActivity, IActivityContext, IActivityProvider, IActivityBroker, IActivityDefinition } from "./types";
import { ActivityContextUtil } from "./activity-context-util";

export class ActivityBroker implements IActivityBroker {

    private activityProviders: Record<string, IActivityProvider> = {};
    private activityDefinitions: Record<string, IActivityDefinition> = {};

    async register(activityProvider: IActivityProvider): Promise<boolean> {
        activityProvider.supportedActivities.forEach(activityDef => {
            this.activityProviders[activityDef.activityId] = activityProvider;
            this.activityDefinitions[activityDef.activityId] = activityDef;
        });
        return true;
    }

    /**
     * If entry activity returns a IEvent, it will be used to drive to next state
     * @param activity 
     * @param stateContext 
     * @param event 
     */
    async executeActivity(activity: IActivity, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IEvent | undefined> {

        const activityProvider = this.activityProviders[activity.activityId];
        if (activityProvider !== undefined) {
            console.log(`executing activity - ${JSON.stringify(activity)}`);

            const activityDef = this.activityDefinitions[activity.activityId];
            const activityContext = await ActivityContextUtil.createActivityContext();
            
            ActivityContextUtil.evalInputProperties(activity, activityDef, activityContext, stateMachineContext, event);
            
            const ret = await activityProvider.executeActivity(activity, activityContext, stateMachineContext, event);
            
            ActivityContextUtil.evalOutputProperties(activity, activityDef, activityContext, stateMachineContext, event);
            activityContext.destroy();

            return ret;
        }
        else {
            console.log(`no activity provider registered for '${activity.activityId}'`);
        }
    }
}