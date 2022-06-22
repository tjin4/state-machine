import { IActivity, IActivityContext, IActivityManifest, IEvent, IStateMachineContext } from "./types";
import { InMemoryContext } from './in-memory/context';

export class ActivityContextUtil {

    static async createActivityContext(): Promise<IActivityContext> {
        const activityContext = await InMemoryContext.createContext();
        return activityContext;
    }

    static async evalInputProperties(activity: IActivity, activityManifest: IActivityManifest, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<void> {
        if(activityManifest.inputProperties){
            for(const propDef of activityManifest.inputProperties) {
                const expression = activity.inputPropertiesExpression?.[propDef.name];
                if(expression === undefined){
                    if(!propDef.isOptional){
                        throw new Error(`missing mandatary input property '${propDef.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
                    }
                }
                else{
                    const expressionWrap = `(${expression})`; // if expression is a json object start with '{', then eval() will confuse it with beginnning of a block, so wrap with ()
                    const value = eval(expressionWrap);
                    await activityContext.set(propDef.name, value);
                }
            };
        }
    }

    static async evalOutputProperties(activity: IActivity, activityManifest: IActivityManifest, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<void> {
        if(activityManifest.outputProperties){
            for(const propDef of activityManifest.outputProperties) {
                const expression = activity.outputPropertiesExpression?.[propDef.name];
                if(expression !== undefined){
                    const propertyValue = await activityContext.get(propDef.name);
                    if(propertyValue === undefined){
                        if(!propDef.isOptional){
                            throw new Error(`missing mandatary output property '${propDef.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
                        }
                    }
                    else {
                        const expressionWrap = `(async()=>{${expression}})()`;
                        eval(expressionWrap); //await stateMachineContext.set('key', propertyValue);
                    }
                }
            };
        }
    }    
}