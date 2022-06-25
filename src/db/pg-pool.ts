import { Pool, PoolConfig, QueryResult } from 'pg';
import config from '../config';

/**
 * a wrapper class on pg pool to manage lifecycle of pg pool
 */
export class PgPool {
    static _instance?: PgPool;

    private _pool: Pool;

    constructor(pgConfig: PoolConfig) {
        this._pool = new Pool(pgConfig);
    }

    static getInstance(): PgPool {
        if (PgPool._instance === undefined) {
            PgPool._instance = new PgPool(config.PgConfig);
        }
        return PgPool._instance;
    }

    static async destroyInstance(): Promise<void> {
        if (PgPool._instance !== undefined) {
            await PgPool._instance.destroy();
            PgPool._instance = undefined;
        }
    }

    async executeQuey(query: string): Promise<QueryResult<any>> {
        try {
            console.debug(`executing query: ${query} ..`);
            const result = await this._pool.query(query);
            console.debug(`query completed, command=${result.command}, rowCount=${result.rowCount}`);
            return result;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    async destroy(): Promise<void> {
        await this._pool.end();
    }
}
