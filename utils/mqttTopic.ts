const TOPIC_ROOT = process.env.NEXT_PUBLIC_MQTT_TOPIC_ROOT || 'breakfast';

const getTopicRoot = () => {
    return `nuu/csie/${TOPIC_ROOT}`;
};

export const getOrderCheckoutTopic = () => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/checkout`;
};

export const getAcceptCustomerOrderTopic = (customerId: number | string) => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/accept/${customerId}`;
};

export const getKitchenOrderTopic = () => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/kitchen`;
};

export const getKitchenReadyOrderTopic = (customerId: number | string) => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/ready/${customerId}`;
};

export const getStaffCompletedOrderTopic = (customerId: number | string) => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/completed/${customerId}`;
};

export const getCustomerCancelOrderTopic = (customerId: number | string) => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/cancel/${customerId}`;
};

export const getOrderStatusWildcardTopic = (customerId: number | string) => {
    const topicRoot = getTopicRoot();
    return `${topicRoot}/notify/order/+/${customerId}`;
}
