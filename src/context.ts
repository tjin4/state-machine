import { IContext } from "./types";
import { v4 as uuidv4 } from 'uuid';
import config from "./config";
import { PgContext } from "./db/pg-context";

export class Context implements IContext {

    readonly contextId: string;
    protected properties: { [key: string]: any } = {};
    protected persistContext?: IContext;

    protected constructor(contextId: string, persistContext?: IContext){
        this.contextId = contextId;
        this.persistContext = persistContext;
    }

    protected async init(): Promise<void>{
        await this.set('contextId', this.contextId);
    }

    static async createContext(contextId?: string): Promise<IContext> {
        if(contextId === undefined){
            contextId = uuidv4();
        }

        let pgContext: IContext | undefined = undefined;
        if(config.PersistContext){
            pgContext = await PgContext.createContext(contextId);
        }

        const context = new Context(contextId, pgContext);
        await context.init();
        return context;
    }

    async get(name: string): Promise<any> {
        if(this.persistContext){
            const value = await this.persistContext.get(name);
            this.properties[name] = value;
        }
        return this.properties[name];
    }

    async set(name: string, value: any): Promise<void> {
        this.properties[name] = value;
        if(this.persistContext){
            await this.persistContext.set(name, value);            
        }
    }
    
    async getProperties(): Promise<Record<string, any>> {
        if(this.persistContext){
            this.properties = await this.persistContext.getProperties();
        }
        return this.properties;
    }
    
    async flush(): Promise<void> {
        if(this.persistContext){
            await this.persistContext.flush();
        }
    }

    async destroy(): Promise<void> {
        this.properties = {};
        if(this.persistContext){
            await this.persistContext.destroy();
        }
    }
}