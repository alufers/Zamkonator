#!/bin/env bash
if [ $# -ne 1 ]; then
    echo "Usage: $0 <device>"
    exit 1
fi
esptool.py -p $1 -b 460800 --before default_reset --after hard_reset --chip esp32 write_flash --flash_mode dio --flash_size detect --flash_freq 80m 0x110000 build/littlefs.bin
