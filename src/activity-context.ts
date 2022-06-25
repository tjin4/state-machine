import { IActivityContext, IContext, CONTEXT_TYPE } from "./types";
import { Context } from "./context";
import { PgContextManager } from "./db/pg-context";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";

export class ActivityContext extends Context implements IActivityContext {

    readonly activityId: string;

    protected constructor(activityId: string, contextId: string, persistContext?: IContext) {
        super(contextId, CONTEXT_TYPE.ACTIVITY, '', persistContext);
        this.activityId = activityId;
        this.initImmutableProps['activityId'] = activityId;
    }

    static async createActivityConext(activityId: string, contextId?: string): Promise<IActivityContext> {
        if (contextId === undefined) {
            contextId = `${CONTEXT_TYPE.ACTIVITY}:${activityId}:${uuidv4()}`;
        }

        let pgContext: IContext | undefined = undefined;
        if (config.PersistContext) {
            pgContext = await PgContextManager.instance.createContext(contextId, CONTEXT_TYPE.STATE_LOCAL, '');
        }

        const context = new ActivityContext(activityId, contextId, pgContext);
        await context.init();
        return context;
    }

}
