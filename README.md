# state-machine
a node js state machine implementation

---
## state machine model

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
## activity 

### activity provider and manifest

### activity broker 

### activity definition in state definition

---
## event

### event broker

---
## contexts

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


## TODO

- event provider and event broker framework, use kafka
- support special state expression in State transit table - ANY, HALT, RegX 
- support state timeout in state definition
