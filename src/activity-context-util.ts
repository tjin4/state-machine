import { IActivity, IActivityContext, IActivityManifest, IActivityPropertyManifest, IEvent, IStateContext, IStateMachineContext } from "./types";
import { InMemoryContext } from './in-memory/context';

export class ActivityContextUtil {

    static async createActivityContext(): Promise<IActivityContext> {
        const activityContext = await InMemoryContext.createContext();
        return activityContext;
    }

    static async evalInputProperties(activity: IActivity, activityManifest: IActivityManifest, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<void> {
        //validate activity.inputPropertiesExpressionEvalMode
        const inputPropertiesEvalMode = activity.inputPropertiesExpressionEvalMode ?? 'async';
        if(activityManifest.allowedInputPropertiesExpressionEvalMode && activityManifest.allowedInputPropertiesExpressionEvalMode !== inputPropertiesEvalMode){
            throw new Error(`activity.inputPropertiesEvalMode '${inputPropertiesEvalMode}' is not allowed in activity manifest '${activityManifest.activityId}'`);
        }

        //setup expression eval context: state, local, event
        const stateContext = await stateMachineContext.currentStateContext();
        if(stateContext === undefined){
            throw new Error('Internal error, activity must run inside a state context');
        }
        let state: IStateMachineContext | Record<string,any> = stateMachineContext;
        let local: IStateContext | Record<string, any> = stateContext;
        if(inputPropertiesEvalMode === 'sync'){
            state = await state.getProperties();
            local = await local.getProperties();
        }
       
        //
        if(activityManifest.inputProperties){
            for(const propManifest of activityManifest.inputProperties) {
                const expression = activity.inputPropertiesExpression?.[propManifest.name];
                if(expression === undefined){
                    if(!propManifest.isOptional){
                        throw new Error(`missing mandatary input property '${propManifest.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
                    }
                }
                else{
                    const value = await ActivityContextUtil.evalInputExpression(inputPropertiesEvalMode, expression, state, local, event);
                    await activityContext.set(propManifest.name, value);
                }
            };
        }
    }

    static async evalOutputProperties(activity: IActivity, activityManifest: IActivityManifest, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<void> {
        const stateContext = await stateMachineContext.currentStateContext();
        if(stateContext === undefined){
            throw new Error('Internal error, activity must run inside a state context');
        }

        //setup expression eval context: state, local, event
        let state: IStateMachineContext | Record<string,any> = stateMachineContext;
        let local: IStateContext | Record<string, any> = stateContext;

        if(activityManifest.outputProperties){
            for(const propManifest of activityManifest.outputProperties) {
                const expression = activity.outputPropertiesExpression?.[propManifest.name];
                if(expression !== undefined){
                    const propertyValue = await activityContext.get(propManifest.name);
                    if(propertyValue === undefined){
                        if(!propManifest.isOptional){
                            throw new Error(`missing mandatary output property '${propManifest.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
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

    private static async evalInputExpression(evalMode: 'sync'|'async', expression: string, state: IStateMachineContext | Record<string,any>, local: IStateContext | Record<string, any>, event?: IEvent): Promise<any> {
        if(evalMode === 'sync'){
            return ActivityContextUtil.evalSyncExpression(expression, state, local, event);
        }
        else{
            return await ActivityContextUtil.evalAsyncExpression(expression, state, local, event);
        }
    }

    private static evalSyncExpression(expression: string, state: IStateMachineContext | Record<string,any>, local: IStateContext | Record<string, any>, event?: IEvent) : any {
        // example: "{id: await state.get('id'), name: await state.get('name')}"
        
        // const expressionWrap = `(${expression})`; // if expression is a json object start with '{', then eval() will confuse it with beginnning of a block, so wrap with ()
        // const value = eval(expressionWrap);

        const expressionWrap = `{return (${expression})}`;
        const func = Function('state', 'local', 'event', expressionWrap);
        const value = func(state, local, event);
        return value;
    }

    private static async evalAsyncExpression(expression: string, state: IStateMachineContext | Record<string,any>, local: IStateContext | Record<string, any>, event?: IEvent) : Promise<any> {
        // example: "`https://${await state.get('host')}:${await state.get('port')}/${await (await local.get('uri')}`"

        const expressionWrap = `{return (${expression})}`;
        const AsyncFunc = Object.getPrototypeOf(async function(){}).constructor;
        const asyncFunc = new AsyncFunc('state', 'local', 'event', expressionWrap);
        const value = await asyncFunc(state, local, event);
        return value;
    }
}