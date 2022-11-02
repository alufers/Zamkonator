{
  description = "ESP8266/ESP32 development tools";

  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: {
    overlay = import ./overlay.nix;
  } // flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
    let
      pkgs = import nixpkgs { inherit system; overlays = [ self.overlay ]; };
    in
    {
      packages = {
        inherit (pkgs)
          gcc-riscv32-esp32c3-elf-bin
          gcc-xtensa-esp32-elf-bin
          gcc-xtensa-esp32s2-elf-bin
          openocd-esp32-bin
          esp-idf

          gcc-xtensa-lx106-elf-bin
          crosstool-ng-xtensa
          gcc-xtensa-lx106-elf;
      };

      devShells = {
        default = import ./shells/esp32-idf.nix { inherit pkgs; };
      };
    });
}

