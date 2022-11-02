#include "Util.h"
// vTaskDelay
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"


void Util::sleepMs(int ms)
{
    vTaskDelay(ms / portTICK_PERIOD_MS);
}
