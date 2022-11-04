#ifndef NETWORKMANAGER_H_
#define NETWORKMANAGER_H_
#include <thread>
#include <memory>
#include "Config.h"
#include "XBus.h"
class NetworkManager
{
public:
    NetworkManager(
        std::shared_ptr<Config> config,
        std::shared_ptr<XBus> xbus);

    /**
     * @brief Starts the network manager on a separate thread.
     *
     */
    void start();

    std::unique_ptr<std::thread> thread;

    static constexpr const char *DEFAULT_PASSWORD = "Zamkonator";

private:
    void run();
    static constexpr const char *TAG = "NetworkManager";
    std::shared_ptr<Config> config;
    std::shared_ptr<XBus> xbus;
    void startAP();
};

#endif // NETWORKMANAGER_H_
