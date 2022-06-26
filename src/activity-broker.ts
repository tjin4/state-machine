import { IEvent, IStateMachineContext, IActivity, IActivityContext, IActivityProvider, IActivityBroker, IActivityManifest } from "./types";
import { ActivityContextUtil } from "./activity-context-util";
import { ContextManager } from "./context-manager";

export class ActivityBroker implements IActivityBroker {

    static readonly instance: ActivityBroker = new ActivityBroker();

    private activityProviders: Record<string, IActivityProvider> = {};
    private activityManifests: Record<string, IActivityManifest> = {};

    async register(activityProvider: IActivityProvider): Promise<boolean> {
        activityProvider.supportedActivities.forEach(activityManifest => {
            this.activityProviders[activityManifest.activityId] = activityProvider;
            this.activityManifests[activityManifest.activityId] = activityManifest;
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

            const activityManifest = this.activityManifests[activity.activityId];
            const activityContext = await ContextManager.instance.createActivityContext(activity.activityId);

            await ActivityContextUtil.evalInputProperties(activity, activityManifest, activityContext, stateMachineContext, event);
            
            const ret = await activityProvider.executeActivity(activity, activityContext, stateMachineContext, event);
            
            await ActivityContextUtil.evalOutputProperties(activity, activityManifest, activityContext, stateMachineContext, event);
            activityContext.destroy();

            return ret;
        }
        else {
            console.log(`no activity provider registered for '${activity.activityId}'`);
        }
    }
}