import dotenv from 'dotenv';
import fs from 'fs';

export interface IPgConfig {
    user: string,
    password: string,
    host: string,
    port: number,
    database: string
}

export interface ITestConfig {
    skip_destroy_context: boolean
}

export interface IConfigData {
    PersistContext: boolean;
    //DBConnectionString: string;
    PgConfig: IPgConfig;

    KafkaBroker: string;
    KafkaTopic: string;
    KafkaCreateTopic: boolean;
    KafkaConsumerGroup: string;

    TestConfig: ITestConfig;

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
            PersistContext: JSON.parse(this.getEnvVariable('PERSIST_CONTEXT', false, 'true')),
            // DBConnectionString: this.getEnvVariable('DB_CONNECTION_STRING', false),
            PgConfig: {
                user: this.getEnvVariable('PGUSER', true),
                password: this.getEnvVariable('PGPASSWORD', true),
                host: this.getEnvVariable('PGHOST', true),
                port: JSON.parse(this.getEnvVariable('PGPORT', true)),
                database: this.getEnvVariable('PGDATABASE', true)
            },
            KafkaBroker: this.getEnvVariable('KAFKA_BROKER', true),
            KafkaTopic: this.getEnvVariable('KAFKA_TOPIC', true),
            KafkaCreateTopic: JSON.parse(this.getEnvVariable('KAFKA_CREATE_TOPIC', false, 'false')),
            KafkaConsumerGroup: this.getEnvVariable('KAFKA_CONSUMER_GROUP', true),
            TestConfig: {
                skip_destroy_context: JSON.parse(this.getEnvVariable('TEST.skip_destoy_context', false, 'false'))
            }
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