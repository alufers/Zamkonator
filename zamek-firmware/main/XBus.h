#ifndef XBUS_H_
#define XBUS_H_
#include <string>
#include <nlohmann/json.hpp>
#include <shared_mutex>
#include <atomic>
#include <memory>
#include <condition_variable>

/**
 * @brief XBus facilitates communication between multiple threads. It is an IPC mechanism.
 *
 */
class XBus
{
public:
    void in(std::string topic, nlohmann::json data);

    /**
     * @brief Accepts a callback function that will be called when a message is received.
     * If the callback returns false, the processing will stop. And the method will return.
     * The callback should prcess the message, but not store it.
     * @param callback
     */
    void out(std::function<bool(std::string topic, const nlohmann::json &data)> callback);
private:
    std::unique_ptr<const nlohmann::json> currentMessage = nullptr;
    std::string currentTopic;

    /**
     * @brief This mutex is used to lock the currentMessage and currentTopic, until all threads finish processing the message.
     */
    std::shared_mutex processing_mutex;
    std::condition_variable notification_var;
    
    

};

#endif // XBUS_H_
