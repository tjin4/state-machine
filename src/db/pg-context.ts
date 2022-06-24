import { IContext } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { PgPool } from './pg-pool';

export class PgContext implements IContext {

    readonly contextId: string;

    protected constructor(contextId: string) {
        this.contextId = contextId;
    }

    protected async init(): Promise<void> {
        await this.insertOrUpdateContextRecord(this.contextId);
        //await context.set('contextId', contextId);
    }

    static async createContext(contextId?: string): Promise<IContext> {
        if (contextId === undefined) {
            contextId = uuidv4();
        }

        const context = new PgContext(contextId);
        await context.init();
        return context;
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
        const strValue = JSON.stringify(value);
        const query = `INSERT INTO context_property (context_id, property_name, property_value) \
VALUES ('${this.contextId}', '${name}', '${strValue}') \
ON CONFLICT (context_id, property_name) DO UPDATE \
SET property_value='${strValue}'`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

    async flush(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async reset(): Promise<void> {
        const query = `DELETE FROM context_property WHERE context_id='${this.contextId}';`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

    async destroy(): Promise<void> {
        const query = `DELETE FROM context_property WHERE context_id='${this.contextId}'; \
DELETE FROM context WHERE context_id='${this.contextId}';`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

    private async insertOrUpdateContextRecord(contextId: string, contextType?: string, description?: string): Promise<any> {
        const query = `INSERT INTO context (context_id, context_type, description) \
VALUES ('${contextId}', '${contextType ?? ''}', '${description ?? ''}') \
ON CONFLICT (context_id) DO UPDATE \
SET context_type='${contextType ?? ''}', description='${description ?? ''}'`;

        const result = await PgPool.getInstance().executeQuey(query);
    }

}