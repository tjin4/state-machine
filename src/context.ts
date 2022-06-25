import { CONTEXT_TYPE, IContext } from "./types";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";
import { PgContextManager } from "./db/pg-context";

export class Context implements IContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    protected properties: { [key: string]: any } = {};
    protected persistContext?: IContext;
    protected immutableProps: Record<string, boolean> = {};
    protected initImmutableProps: Record<string, any> = {};

    protected constructor(contextId: string, contextType: CONTEXT_TYPE, description: string, persistContext?: IContext) {
        this.contextId = contextId;
        this.contextType = contextType;
        this.description = description;
        this.initImmutableProps['contextId'] = this.contextId;

        this.persistContext = persistContext;
    }

    protected async init(): Promise<void> {
        for(const name in this.initImmutableProps){
            await this.set(name, this.initImmutableProps[name]);
            this.immutableProps[name] = true;
        }
        this.initImmutableProps = {};
    }

    // static async createContext(contextId: string | undefined, contextType: CONTEXT_TYPE, description: string): Promise<IContext> {
    //     if (contextId === undefined) {
    //         contextId = `${contextType}:${uuidv4()}`;
    //     }

    //     let pgContext: IContext | undefined = undefined;
    //     if (config.PersistContext) {
    //         pgContext = await PgContextManager.instance.createContext(contextId, contextType, description);
    //     }

    //     const context = new Context(contextId, contextType, description, pgContext);
    //     return context;
    // }

    async get(name: string): Promise<any> {
        if (this.persistContext) {
            const value = await this.persistContext.get(name);
            this.properties[name] = value;
        }
        return this.properties[name];
    }

    async set(name: string, value: any): Promise<void> {
        if (this.immutableProps[name]) {
            return;
        }

        this.properties[name] = value;
        if (this.persistContext) {
            await this.persistContext.set(name, value);
        }
    }

    async getProperties(): Promise<Record<string, any>> {
        if (this.persistContext) {
            this.properties = await this.persistContext.getProperties();
        }
        return this.properties;
    }

    async reset(): Promise<void> {
        this.properties = {};
        if (this.persistContext) {
            await this.persistContext.reset();
        }
    }

    async destroy(): Promise<void> {
        this.properties = {};
        if (this.persistContext) {
            await this.persistContext.destroy();
        }
    }
}