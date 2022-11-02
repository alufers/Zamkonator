#include "App.h"

App::App() : currentConfig(Storage::FS_MOUNT_POINT + std::string("/config.json"))
{
}

void App::run()
{
}
