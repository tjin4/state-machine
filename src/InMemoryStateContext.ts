import { EXEC_STATUS, IStateContext } from "./types";

export class InMemoryStateContext implements IStateContext {

    instanceId?: string | undefined;

    private _properties: { [key: string]: any } = {};

    async get(key: string): Promise<any> {
        return this._properties[key];
    }

    async set(key: string, value: any): Promise<void> {
        this._properties[key] = value;
    }
    
    async getProperties(): Promise<Record<string, any>> {
        return this._properties;
    }

    async getInstanceId(): Promise<string | undefined> {
        const instanceId = await this.get('instanceId');
        this.instanceId = instanceId;
        return instanceId;
    }

    async setInstanceId(instanceId: string): Promise<void> {
        this.instanceId = instanceId;
        await this.set('instanceId', instanceId);
    }

    async getStateId(): Promise<string | undefined> {
        return await this.get('stateId');
    }

    async setStateId(stateId?: string): Promise<void> {
        await this.set('stateId', stateId);
    }
    
    async getExecStatus(): Promise<EXEC_STATUS> {
        return await this.get('execStatus');
    }

    async setExecStatus(execStatus: EXEC_STATUS): Promise<void> {
        await this.set('execStatus', execStatus);
    }
}