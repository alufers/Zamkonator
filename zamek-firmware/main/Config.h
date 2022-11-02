#ifndef CONFIG_H_
#define CONFIG_H_
#include <string>
#include <nlohmann/json.hpp>
#include "Storage.h"

class Config
{

public:
    nlohmann::json data;
    
    Config(std::string path);
    std::string getKey(std::string key);
    void setKey(std::string key, std::string value);
    void setKey(std::string key, int value);

private:
    static constexpr const char *TAG = "Config";
    std::string path;
};

#endif // CONFIG_H_
