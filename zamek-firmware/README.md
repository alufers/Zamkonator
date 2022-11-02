# Zamkonator firmware

## Building

NixOS flake based on https://github.com/mirrexagon/nixpkgs-esp-dev

## Partitions layout


| Name | Type | SubType | Offset | Size | Flags |
| ---- | ---- | ------- | ------ | ---- | ----- |
| nvs | data | nvs | 0x9000 | 0x6000 | |
| phy_init | data | phy | 0xf000 | 0x1000 | |
| factory | app | factory | 0x10000 | 1M | |
| littlefs | data | spiffs | | 0xF0000 | |
