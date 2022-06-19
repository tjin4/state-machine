import { IStateMachineContext } from "./types";
import { InMemoryStateMachineContext } from "./in-memory/state-machine-context";

export class StateMachineContextFactory {

    static async createStateMachineContext(stateMachineDefId: string): Promise<IStateMachineContext> {
        const context = await InMemoryStateMachineContext.createStateMachineContext(stateMachineDefId);
        return context;
    }

}