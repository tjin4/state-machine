import { IStateMachineContext } from "./types";
import { InMemoryStateMachineContext } from "./inmemory-state-machine-context";
import { v4 as uuidv4 } from 'uuid';

export class StateContextFactory {

    static async createStateContext(): Promise<{ instanceId: string, context: IStateMachineContext }> {
        const context = new InMemoryStateMachineContext();
        const instanceId = uuidv4();
        await context.setInstanceId(instanceId);
        return { instanceId, context };
    }

}