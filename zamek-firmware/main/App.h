#ifndef APP_H_
#define APP_H_
#include "Config.h"
#include "NetworkManager.h"

class App
{
    Config currentConfig;
    NetworkManager networkManager;

public:
    App();
    void run();
};

#endif // APP_H_
