#include "NetworkManager.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_mac.h"
#include "esp_event.h"
#include "lwip/err.h"
#include "lwip/sys.h"

NetworkManager::NetworkManager(std::shared_ptr<Config> config)
{
    this->config = config;
}

void NetworkManager::start()
{
    thread = std::make_unique<std::thread>(&NetworkManager::run, this);
}

void NetworkManager::run()
{
    ESP_LOGI(TAG, "Network manager thread started");

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_ap();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    auto networkConfigured = this->config->getKey("network.configured");
    if (!networkConfigured.is_boolean() || !networkConfigured.get<bool>())
    {
        ESP_LOGI(TAG, "Network not configured");
        startAP();

        return;
    }
}

void NetworkManager::startAP()
{
    ESP_LOGI(TAG, "Starting AP");
    uint8_t mac[6];
    esp_wifi_get_mac(WIFI_IF_AP, mac);

    char ssidBytes[32];
    std::snprintf(ssidBytes, sizeof(ssidBytes), "Zamek-%02x%02x%02x", mac[3], mac[4], mac[5]);
    wifi_config_t wifi_config;
    std::memset(&wifi_config, 0, sizeof(wifi_config));
    std::memcpy(wifi_config.ap.ssid, ssidBytes, sizeof(ssidBytes));
    wifi_config.ap.ssid_len = std::strlen(ssidBytes);
    wifi_config.ap.max_connection = 4;
    wifi_config.ap.authmode = WIFI_AUTH_WPA_WPA2_PSK;
    std::memcpy(wifi_config.ap.password, NetworkManager::DEFAULT_PASSWORD, std::strlen(NetworkManager::DEFAULT_PASSWORD));
    wifi_config.ap.channel = 1;

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_AP));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_LOGI(TAG, "AP started (%s, %s)", ssidBytes, NetworkManager::DEFAULT_PASSWORD);
}
