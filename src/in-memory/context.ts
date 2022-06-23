import { IContext } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class InMemoryContext implements IContext {

    readonly contextId: string;
    protected properties: { [key: string]: any } = {};
    protected persistContext?: IContext;

    protected constructor(contextId: string, persistContext?: IContext){
        this.contextId = contextId;
        this.persistContext = persistContext;
    }

    async init(): Promise<void>{
        await this.set('contextId', this.contextId);
    }

    static async createContext(contextId?: string): Promise<IContext> {
        if(contextId === undefined){
            contextId = uuidv4();
        }
        const context = new InMemoryContext(contextId);
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