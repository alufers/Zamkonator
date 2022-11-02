#include "App.h"
#include "Util.h"

App::App() : currentConfig(Storage::FS_MOUNT_POINT + std::string("/config.json"))
{
}

void App::run()
{
    this->networkManager.start();
    while(true) {
        Util::sleepMs(1000);
    }
}
