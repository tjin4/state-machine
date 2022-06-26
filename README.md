# state-machine
a node js state machine implementation

## Quick Start

### Setup Dev Environment
- node js
- VS code
- Docker desktop

### Run test

```
//
npm install

//
npm run restart-db

//
npm run build

//
npm run test

```


---
## State Machine model

A workflow engine is a special use case of state machine.

### state machine definition

- state table
- state transition table


### state definition

### activity definition


### transient state (activity state)
A transient state is a state with entry-activity that returns a event, which will be used to drive to next state immediately.

### composite state machines
- a state machine instance can create and run another state machine instance and pass properties


---
## Activity model

### activity provider and manifest

### activity broker 

### activity definition in state definition

---
## event

### event broker

---
## Contexts

### state machine context

- state machine context (persist across all states in the state machine instance)
- state context (local to state)
- parent state machine context
- child state machine context

### state local context
- local to the current state
- used to share state between entryActivity and exitActivity

### activitiy context
- local to the activity
- acvitity input properties expressions will be evaluated and set to activity context
- activity output properties expressions will be evaluated and set to the state machine context or state local context

### persistent context


## Examples

```javascript
{
    "$schema": "urn:x-bloomberg-com:app-portal:state-machine-definition-dictionary",
    "definitionId": "a-sample-statemachine-definition",
    "description": "",
    "initStateId": "state1",
    "states": {
        "state1": {
            "stateId": "state1",
            "descption": "listen ib",
            "entryActivity": {
                "activityId": "123456-1",
                "name": "listen-ib",
                "config": {
                    "room-id": "my room"
                }
            }
        },
        "state2": {
            "stateId": "state2",
            "descption": "a transient state",
            "entryActivity": {
                "activityId": "test-activity:return-event",
                "name": "return event2",
                "inputPropertiesExpressionEvalMode": "async", 
                "inputPropertiesExpression": {
                    "event": "{'eventId': 'event-from-entry-activity', 'properties': { 'info': `${await state.get('stateId')}  ${event.eventId}`} }"
                },
                "outputPropertiesExpression": {
                    "output-prop1": "state['output-from-test-activity']"
                }
            }
        },
        "state3": {
            "stateId": "state3",
            "descption": "check citi bike",
            "entryActivity": {
                "activityId": "123456-2",
                "name": "http get",
                "config": {
                    "url": "https://www.citi-bike.com"
                }
            }
        }
    },
    "stateTransitions": {
        "state1": {
            "event1": "state2",
            "event2": "state3"
        },
        "state2": {
            "event1": "state1",
            "event-from-entry-activity": "state3"
        },
        "state3": {
            "event3": "state1"
        }
    }
}
```


## TODO

- event provider and event broker framework, use kafka
- support special state expression in State transit table - ANY, HALT, RegX 
- support state timeout in state definition
