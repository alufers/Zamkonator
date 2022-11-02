#ifndef STORAGE_H_
#define STORAGE_H_

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

/**
 * @brief The Storage class exposes various static utility methods for access ing the flash memory.
 *
 */
class Storage
{
public:
    static constexpr const char *FS_MOUNT_POINT = "/littlefs";
    static std::vector<std::string> listFiles(std::string path);
    static nlohmann::json readJson(std::string path);
    static void writeJson(std::string path, nlohmann::json data);
};

#endif // STORAGE_H_
