#include "Config.h"
#include "esp_log.h"

Config::Config(std::string path)
{
    this->path = path;
    try
    {
        data = Storage::readJson(path);
        ESP_LOGI(TAG, "Config loaded from %s", path.c_str());
    }
    catch (std::runtime_error &e)
    {
        data = nlohmann::json::object();
        Storage::writeJson(path, data);
        ESP_LOGI(TAG, "Config created at %s", path.c_str());
    }
}

nlohmann::json  Config::getKey(std::string key)
{
    std::shared_lock<std::shared_mutex> lock(mutex);
   
   // split the key by dots
    std::string keyLeft = key;
    nlohmann::json current = data;
    while(keyLeft.find(".") != std::string::npos)
    {
        std::string keyPart = keyLeft.substr(0, keyLeft.find("."));
        keyLeft = keyLeft.substr(keyLeft.find(".") + 1);
        if(!current.contains(keyPart))
        {
            return nlohmann::json(nullptr);
        }
        current = current[keyPart];
    }
    return current;
}

void Config::setKey(std::string key, std::string value)
{
    std::unique_lock<std::shared_mutex> lock(mutex);
    // split the key by dots
    std::string keyLeft = key;
    nlohmann::json current = data;
    while(keyLeft.find(".") != std::string::npos)
    {
        std::string keyPart = keyLeft.substr(0, keyLeft.find("."));
        keyLeft = keyLeft.substr(keyLeft.find(".") + 1);
        current = current[keyPart];
    }
    current[keyLeft] = value;
    Storage::writeJson(path, data);
}

void Config::setKey(std::string key, int value)
{
    std::unique_lock<std::shared_mutex> lock(mutex);
    // split the key by dots
    std::string keyLeft = key;
    nlohmann::json current = data;
    while(keyLeft.find(".") != std::string::npos)
    {
        std::string keyPart = keyLeft.substr(0, keyLeft.find("."));
        keyLeft = keyLeft.substr(keyLeft.find(".") + 1);
        current = current[keyPart];
    }
    current[keyLeft] = value;
    Storage::writeJson(path, data);
}

void Config::save()
{
    Storage::writeJson(path, data);
}
