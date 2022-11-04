#include "XBus.h"

void XBus::in(std::string topic, nlohmann::json data)
{
    std::unique_lock<std::shared_mutex> lock(processing_mutex);
    currentMessage = std::make_unique<const nlohmann::json>(data);
    currentTopic = topic;
    notification_var.notify_all();
}

void XBus::out(std::function<bool(std::string topic, const nlohmann::json &data)> callback)
{
    std::unique_lock<std::shared_mutex> lock(processing_mutex);
    while (true)
    {
        notification_var.wait(lock);
        if (callback(currentTopic, *currentMessage))
        {
            currentMessage = nullptr;
            currentTopic = "";
        }
        else
        {
            break;
        }
    }
}
