#include <stdio.h>
#include "sdkconfig.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_chip_info.h"
#include "esp_flash.h"
#include "main.h"
#include "esp_littlefs.h"
#include "esp_err.h"
#include "esp_log.h"
#include "esp_system.h"
#include <memory>


#include "Storage.h"

#define TAG "main"

static void initialize_littlefs();

void app_main(void)
{
    initialize_littlefs();

    std::unique_ptr<App> app = std::make_unique<App>();
    app->run();
}

static void initialize_littlefs()
{
    esp_vfs_littlefs_conf_t conf = {
        .base_path = Storage::FS_MOUNT_POINT,
        .partition_label = "littlefs",
        .format_if_mount_failed = true,
        .dont_mount = false,
    };

    // Use settings defined above to initialize and mount LittleFS filesystem.
    // Note: esp_vfs_littlefs_register is an all-in-one convenience function.
    esp_err_t ret = esp_vfs_littlefs_register(&conf);

    if (ret != ESP_OK)
    {
        if (ret == ESP_FAIL)
        {
            ESP_LOGE(TAG, "Failed to mount or format filesystem");
        }
        else if (ret == ESP_ERR_NOT_FOUND)
        {
            ESP_LOGE(TAG, "Failed to find LittleFS partition");
        }
        else
        {
            ESP_LOGE(TAG, "Failed to initialize LittleFS (%s)", esp_err_to_name(ret));
        }
        return;
    }
    ESP_LOGI(TAG, "LittleFS initialized, listing files");
    auto files = Storage::listFiles(Storage::FS_MOUNT_POINT);
    ESP_LOGI(TAG, "Found %d files", files.size());
    for (auto file : files)
    {
        ESP_LOGI(TAG, "File: %s", file.c_str());
    }
        
}
