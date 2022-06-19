import { IStateContext } from "./types";
import { InMemoryContext } from "./inmemory-context";

export class InMemoryStateContext extends InMemoryContext implements IStateContext {

    constructor(contextId: string) {
        super(contextId);
    }

}
