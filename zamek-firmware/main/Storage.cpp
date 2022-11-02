#include "Storage.h"
#include <sys/types.h>
#include <dirent.h>
#include <stdexcept>

std::vector<std::string> Storage::listFiles(std::string path)
{
    std::vector<std::string> files;
    struct dirent *de; // Pointer for directory entry
    DIR *dr = opendir(path.c_str());
    if (dr == NULL) // opendir returns NULL if couldn't open directory
    {
        throw std::runtime_error("Could not open directory " + path);
    }
    while ((de = readdir(dr)) != NULL)
    {
        files.push_back(de->d_name);
    }
    closedir(dr);
    return files;
}
