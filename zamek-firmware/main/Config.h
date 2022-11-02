#ifndef CONFIG_H_
#define CONFIG_H_
#include <string>
#include <nlohmann/json.hpp>
#include "Storage.h"
#include <shared_mutex>

class Config
{

public:
    nlohmann::json data;
    std::shared_mutex mutex;

    Config(std::string path);
    nlohmann::json getKey(std::string key);
    /**
     * @brief Set a key in the config. It also takes care of locking the mutex.
     *
     * @param key
     * @param value
     */
    void setKey(std::string key, std::string value);
    void setKey(std::string key, int value);

    void save();

private:
    static constexpr const char *TAG = "Config";
    std::string path;
};

#endif // CONFIG_H_
