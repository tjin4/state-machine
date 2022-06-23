import { IStateMachineContext } from "./types";
import { StateMachineContext } from "./state-machine-context";

export class StateMachineContextFactory {

    static async createStateMachineContext(stateMachineDefId: string): Promise<IStateMachineContext> {
        const context = await StateMachineContext.createStateMachineContext(stateMachineDefId);
        return context;
    }

}