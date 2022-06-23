import dotenv from 'dotenv';
import fs from 'fs';

export interface IConfigData {
    DBConnectionString: string;
}

class Config {

    constructor() {
        this.loadEnv();
    }

    private loadEnv() {
        let envPath = `${__dirname}/.env`;
        const output = dotenv.config({ path: envPath });
        console.info(`load env complet. output: \n${JSON.stringify(output, null, 2)}`);
    }

    public configData(): IConfigData {
        return {
            DBConnectionString: this.getEnvVariable('DB_CONNECTION_STRING', true)
        };
    }

    private getEnvVariable(name: string, throwOnUndefined: boolean = false, defaultValue: string = ''): string {
        let val = process.env[name];
        if (val === undefined) {
            val = defaultValue;
            if (throwOnUndefined) {
                throw new Error(`Environment variable '${name}' is not set`);
            }
        }
        return val;
    }
}

const config = new Config();
export default config.configData();;