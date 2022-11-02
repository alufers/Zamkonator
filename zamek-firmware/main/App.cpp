#include "App.h"
#include "Util.h"

App::App() : currentConfig(std::make_shared<Config>(
                 Storage::FS_MOUNT_POINT + std::string("/config.json"))),
             networkManager(
                std::make_unique<NetworkManager>(currentConfig)
             )
{
}

void App::run()
{
    this->networkManager->start();
    while (true)
    {
        Util::sleepMs(1000);
    }
}
