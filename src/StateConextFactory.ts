import { IStateContext } from "./types";
import { InMemoryStateContext } from "./InMemoryStateContext";
import { v4 as uuidv4 } from 'uuid';

export class StateContextFactory {

    static async createStateContext(): Promise<{ instanceId: string, context: IStateContext }> {
        const context = new InMemoryStateContext();
        const instanceId = uuidv4();
        await context.setInstanceId(instanceId);
        return { instanceId, context };
    }

}