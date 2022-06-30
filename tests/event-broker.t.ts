import { IEvent } from "../src/types";
import { EventBroker } from "../src/event-broker";



describe('EventBroker tests', ()=>{

    beforeAll(async ()=>{
        await EventBroker.instance.init();
    })

    afterAll(async ()=>{
        await EventBroker.instance.destroy();
    })
 
    test('EventBroker.publish', async ()=>{
        const event: IEvent = {
            eventId: 'testEvent',
            stateMachineId: 'stateMachineId-test',
            properties: {}
        };
        await EventBroker.instance.publish(event);
        
    })


})