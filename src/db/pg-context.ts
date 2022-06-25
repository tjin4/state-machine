import { CONTEXT_TYPE, IContext, IContextManager } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PgPool } from './pg-pool';
import config from '../config';

export class PgContextManager implements IContextManager {

    static readonly instance: PgContextManager = new PgContextManager();

    async getContexts(contextType: CONTEXT_TYPE): Promise<IContext[]> {
        const query = `select context_id, context_type, description from context where context_type='${contextType}'`;

        const contexts: IContext[] = [];
        const result = await PgPool.getInstance().executeQuey(query);
        for (let i = 0; i < result.rowCount; i++) {
            const row = result.rows[i];
            const context = new PgContext(row[0], row[1], row[2]);
            contexts.push(context);
        }

        return contexts;
    }

    async getContext(contextId: string): Promise<IContext | null> {
        const query = `select context_id, context_type, description from context where context_id='${contextId}'`;

        let context: IContext | null = null;
        const result = await PgPool.getInstance().executeQuey(query);
        if (result.rowCount === 1) {
            const row = result.rows[0];
            context = new PgContext(row[0], row[1], row[2]);
        }

        return context;
    }

    async createContext(contextId: string | undefined, contextType: CONTEXT_TYPE, description: string, initReadOnlyProps?: Record<string, any>): Promise<IContext> {
        if (contextId === undefined) {
            contextId = `${contextType}:${uuidv4()}`;
        }

        const query = `INSERT INTO context (context_id, context_type, description) \
VALUES ('${contextId}', '${contextType}', '${description ?? ''}')`;

        const result = await PgPool.getInstance().executeQuey(query);
        if (result.rowCount !== 1) {
            throw new Error('Internal error, create context result rowCount is not 1');
        }
        const context = new PgContext(contextId, contextType, description);
        if(initReadOnlyProps){
            await context.init(initReadOnlyProps);
        }
        return context;
    }

    async deleteContext(contextId: string): Promise<number> {
        const query = `DELETE FROM context_property WHERE context_id='${contextId}'; \
DELETE FROM context WHERE context_id='${contextId}';`;
        const result = await PgPool.getInstance().executeQuey(query);
        return result.rowCount;
    }

}

/**
 * 
 */
class PgContext implements IContext {

    readonly contextId: string;
    readonly contextType: CONTEXT_TYPE;
    readonly description: string;

    private readOnlyPropNames: Record<string, boolean> = {};

    constructor(contextId: string, contextType: CONTEXT_TYPE, description: string) {
        this.contextId = contextId;
        this.contextType = contextType;
        this.description = description;
    }

    async init(initReadOnlyProps: Record<string, any>): Promise<void> {
        for (const name in initReadOnlyProps) {
            await this.set(name, initReadOnlyProps[name]);
            this.readOnlyPropNames[name] = true;
        }
    }

    async getProperties(): Promise<Record<string, any>> {
        throw new Error("not implemented");
    }

    async get(name: string): Promise<any> {
        const query = `SELECT property_value from context_property WHERE context_id='${this.contextId}' AND property_name='${name}'`;

        const result = await PgPool.getInstance().executeQuey(query);
        if (result.rowCount === 1) {
            const row = result.rows[0];
            const property_value = row.property_value;
            try {
                const obj = JSON.parse(property_value);
                return obj;
            }
            catch (err) { }
            return property_value;
        }
    }

    async set(name: string, value: any): Promise<void> {
        if (this.readOnlyPropNames[name]) {
            throw new Error(`Trying to set readonly property '${name}'`);
        }

        const strValue = JSON.stringify(value);
        const query = `INSERT INTO context_property (context_id, property_name, property_value) \
VALUES ('${this.contextId}', '${name}', '${strValue}') \
ON CONFLICT (context_id, property_name) DO UPDATE \
SET property_value='${strValue}'`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

    async reset(): Promise<void> {
        const query = `DELETE FROM context_property WHERE context_id='${this.contextId}';`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

    async destroy(): Promise<void> {
        if (config.TestConfig.skip_destroy_context) {
            return;
        }

        await PgContextManager.instance.deleteContext(this.contextId);
    }

}