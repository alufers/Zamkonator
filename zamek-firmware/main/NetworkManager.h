#ifndef NETWORKMANAGER_H_
#define NETWORKMANAGER_H_
#include <thread>
#include <memory>

class NetworkManager
{
public:
    NetworkManager();

    /**
     * @brief Starts the network manager on a separate thread.
     *
     */
    void start();

    std::unique_ptr<std::thread> thread;

private:
    void run();
    static constexpr const char *TAG = "NetworkManager";
};

#endif // NETWORKMANAGER_H_
