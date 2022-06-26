import { StateMachineDefinition } from "./state-machine-definition";

export class StateMachineDefinitionRegistry {

    static readonly instance: StateMachineDefinitionRegistry = new StateMachineDefinitionRegistry();

    private registry: Record<string, StateMachineDefinition> = {};

    async register(def: StateMachineDefinition): Promise<void> {
        this.registry[def.doc.definitionId] = def;
    }

    async find(stateMachineDefId: string): Promise<StateMachineDefinition | null> {
        const def = this.registry[stateMachineDefId];
        return def ?? null;
    }


}