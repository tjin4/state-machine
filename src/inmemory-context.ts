import { IContext } from "./types";
import { v4 as uuidv4 } from 'uuid';

export class InMemoryContext implements IContext {

    readonly contextId: string;
    protected _properties: { [key: string]: any } = {};

    protected constructor(contextId: string){
        this.contextId = contextId;
    }

    static async createContext(contextId?: string): Promise<IContext> {
        if(contextId === undefined){
            contextId = uuidv4();
        }
        const context = new InMemoryContext(contextId);
        await context.set('contextId', contextId);
        return context;
    }

    static async load(contextId:string): Promise<IContext> {
        throw new Error ("not implemented");
    }

    async get(key: string): Promise<any> {
        return this._properties[key];
    }

    async set(key: string, value: any): Promise<void> {
        this._properties[key] = value;
    }
    
    async getProperties(): Promise<Record<string, any>> {
        return this._properties;
    }
    
    async destroy(): Promise<void> {
        
    }
}