#ifndef APP_H_
#define APP_H_
#include "Config.h"
#include "NetworkManager.h"
#include <memory>

class App
{
    std::shared_ptr<Config> currentConfig;
    std::unique_ptr<NetworkManager> networkManager;

public:
    App();
    void run();
};

#endif // APP_H_
