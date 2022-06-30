import { IEvent, IEventBroker } from "./types";
import { Kafka, logLevel, Producer as KafkaProducer, Consumer as KafkaConsumer, Admin as KafkaAdmin, ITopicConfig, EachMessagePayload} from 'kafkajs';
import config from "./config";

export class EventBroker implements IEventBroker {

    static readonly instance: EventBroker = new EventBroker();

    private kafka: Kafka;
    private kafkaAdmin: KafkaAdmin;
    private kafkaProducer: KafkaProducer;
    private kafkaConsumer: KafkaConsumer;

    constructor() {
        this.kafka = new Kafka({
            logLevel: logLevel.INFO,
            clientId: config.KafkaTopic,
            brokers: [config.KafkaBroker]
        });
        this.kafkaAdmin = this.kafka.admin();
        this.kafkaProducer = this.kafka.producer();
        this.kafkaConsumer = this.kafka.consumer({ groupId: config.KafkaConsumerGroup });
    }

    async init(): Promise<void> {
        await this.kafkaAdmin.connect();
        if(config.KafkaCreateTopic){
            await this.createTopic();
        }

        await this.kafkaProducer.connect();

        await this.kafkaConsumer.connect();
        await this.kafkaConsumer.subscribe({topic: config.KafkaTopic});
        await this.kafkaConsumer.run({eachMessage: this.onKafkaMessage});
    }

    async destroy(): Promise<void> {
        await this.kafkaAdmin.disconnect();
        await this.kafkaProducer.disconnect();
        await this.kafkaConsumer.disconnect();
    }

    private async createTopic(): Promise<void> {
        const topicConfig: ITopicConfig = { topic: config.KafkaTopic };
        await this.kafkaAdmin.createTopics({ topics: [topicConfig] });
    }

    private async onKafkaMessage(payload: EachMessagePayload): Promise<void>{
        console.log(JSON.stringify(payload));
    }

    async subscribe(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async publish(event: IEvent): Promise<boolean> {
        try {
            await this.kafkaProducer.send({
                topic: config.KafkaTopic,
                messages: [
                    { value: JSON.stringify(event) }
                ]
            });
            return true;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

}