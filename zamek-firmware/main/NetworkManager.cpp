#include "NetworkManager.h"
#include "esp_log.h"

NetworkManager::NetworkManager()
{
}

void NetworkManager::start()
{
    thread = std::make_unique<std::thread>(&NetworkManager::run, this);
}

void NetworkManager::run()
{
    ESP_LOGI(TAG, "Network manager thread started");
}
