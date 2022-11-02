#ifndef STORAGE_H_
#define STORAGE_H_

#include <string>
#include <vector>

class Storage
{
public:
    static constexpr const char *FS_MOUNT_POINT = "/littlefs";
    static std::vector<std::string> listFiles(std::string path);
};

#endif // STORAGE_H_
