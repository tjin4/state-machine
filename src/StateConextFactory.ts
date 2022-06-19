import { IStateMachineContext } from "./types";
import { InMemoryStateMachineContext } from "./inmemory-state-machine-context";

export class StateContextFactory {

    static async createStateMachineContext(): Promise<IStateMachineContext> {
        const context = await InMemoryStateMachineContext.create();
        return context;
    }

}