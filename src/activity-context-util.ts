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
        if (activityManifest.allowedInputPropertiesExpressionEvalMode && activityManifest.allowedInputPropertiesExpressionEvalMode !== inputPropertiesEvalMode) {
            throw new Error(`activity.inputPropertiesEvalMode '${inputPropertiesEvalMode}' is not allowed in activity manifest '${activityManifest.activityId}'`);
        }

        //setup expression eval context: state, local, event
        const stateContext = await stateMachineContext.currentStateContext();
        if (stateContext === undefined) {
            throw new Error('Internal error, activity must run inside a state context');
        }
        let state: IStateMachineContext | Record<string, any> = stateMachineContext;
        let local: IStateContext | Record<string, any> = stateContext;
        if (inputPropertiesEvalMode === 'sync') {
            state = await state.getProperties();
            local = await local.getProperties();
        }

        //
        if (activityManifest.inputProperties) {
            for (const propManifest of activityManifest.inputProperties) {
                const expression = activity.inputPropertiesExpression?.[propManifest.name];
                if (expression === undefined) {
                    if (!propManifest.isOptional) {
                        throw new Error(`missing mandatary input property '${propManifest.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
                    }
                }
                else {
                    const value = await ActivityContextUtil.evalInputPropertyExpression(inputPropertiesEvalMode, expression, state, local, event);
                    await activityContext.set(propManifest.name, value);
                }
            };
        }
    }

    static async evalOutputProperties(activity: IActivity, activityManifest: IActivityManifest, activityContext: IActivityContext, stateMachineContext: IStateMachineContext, event?: IEvent): Promise<void> {
        const stateContext = await stateMachineContext.currentStateContext();
        if (stateContext === undefined) {
            throw new Error('Internal error, activity must run inside a state context');
        }

        //setup expression eval context: state, local
        let state: IStateMachineContext = stateMachineContext;
        let local: IStateContext = stateContext;

        if (activityManifest.outputProperties) {
            for (const propManifest of activityManifest.outputProperties) {
                const expression = activity.outputPropertiesExpression?.[propManifest.name];
                if (expression !== undefined) {
                    const propertyValue = await activityContext.get(propManifest.name);
                    if (propertyValue === undefined) {
                        if (!propManifest.isOptional) {
                            throw new Error(`missing mandatary output property '${propManifest.name}' in activity '${activity.activityId}' [stateMachineId=${stateMachineContext.contextId}], stateId=${stateMachineContext.stateId()}`);
                        }
                    }
                    else {
                        // const expressionWrap = `(async()=>{${expression}})()`;
                        // eval(expressionWrap); //await stateMachineContext.set('key', propertyValue);
                        await ActivityContextUtil.evalOutputPropertyExpression(expression, propertyValue, state, local);
                    }
                }
            };
        }
    }

    private static async evalInputPropertyExpression(evalMode: 'sync' | 'async', expression: string, state: IStateMachineContext | Record<string, any>, local: IStateContext | Record<string, any>, event?: IEvent): Promise<any> {
        if (evalMode === 'sync') {
            return ActivityContextUtil.evalSyncInputPropertyExpression(expression, state, local, event);
        }
        else {
            return await ActivityContextUtil.evalAsyncInputPropertyExpression(expression, state, local, event);
        }
    }

    private static evalSyncInputPropertyExpression(expression: string, state: IStateMachineContext | Record<string, any>, local: IStateContext | Record<string, any>, event?: IEvent): any {
        // example expression: "{host: state['id'], port: local.port, uri: event.properties['uri']}"
        // example expression: "`https://${state.host}:${local.port}/${local.uri)}`"

        const expressionWrap = `{return (${expression})}`;
        const func = Function('state', 'local', 'event', expressionWrap);
        const value = func(state, local, event);
        return value;
    }

    private static async evalAsyncInputPropertyExpression(expression: string, state: IStateMachineContext | Record<string, any>, local: IStateContext | Record<string, any>, event?: IEvent): Promise<any> {
        // example expression: "{host: await state.get('host'), port: await local.get('port'), uri: event.properties['uri']}"
        // example expression: "`https://${await state.get('host')}:${await local.get('port')}/${event.properties['uri']}`"

        const expressionWrap = `{return (${expression})}`;
        const AsyncFunc = Object.getPrototypeOf(async function () { }).constructor;
        const asyncFunc = new AsyncFunc('state', 'local', 'event', expressionWrap);
        const value = await asyncFunc(state, local, event);
        return value;
    }

    private static async evalOutputPropertyExpression(expression: string, propertyValue: any, state: IStateMachineContext, local: IStateContext): Promise<void> {
        // example: "state.propertyName", "state['propertyName']", "local.propertyName"

        const { context, propertyName } = this.extractOutputPropertyExpress(expression);
        const expressionWrap = `{await ${context}.set("${propertyName}", propertyValue);}`;
        const AsyncFunc = Object.getPrototypeOf(async function () { }).constructor;
        const asyncFunc = new AsyncFunc('state', 'local', 'propertyValue', expressionWrap);
        await asyncFunc(state, local, propertyValue);
    }

    private static extractOutputPropertyExpress(expression: string): { context: string, propertyName: string } {

        // normalize to dot format
        let expression_ = expression.trim()
            .replace('[', '.')
            .replace('"', '')
            .replace("'", "")
            .replace(']', '');

        const dotIdx = expression_.indexOf('.');
        if (dotIdx <= 0) {
            throw new Error(`output property expresssion is not in valid format ${expression}`);
        }
        const context = expression_.slice(0, dotIdx);
        if (context !== 'state' && context !== 'local') {
            throw new Error(`output property expresssion is not in valid format, context part must be "state" or "local",  ${expression}`);
        }
        const propertyName = expression_.slice(dotIdx + 1);
        return { context, propertyName };

    }
}