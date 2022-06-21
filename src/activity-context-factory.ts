import { IActivity, IActivityContext, IActivityDefinition, IEvent, IStateMachineContext } from "./types";
import { InMemoryContext } from './in-memory/context';

export class ActivityContextFactory {

    static async createActivityContext(activity: IActivity, activityDef: IActivityDefinition, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<IActivityContext> {
        const activityContext = await InMemoryContext.createContext();
        if(activityDef.inputProperties){
            for(const propDef of activityDef.inputProperties) {
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

        return activityContext;
    }
}