{
  description = "ESP32 based electronic lock system";

  inputs = {
     nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs-esp-dev.url = "github:mirrexagon/nixpkgs-esp-dev";
  };

  outputs = { self, nixpkgs, flake-utils, nixpkgs-esp-dev }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs {
        inherit system;
        overlays = [
         (import "${nixpkgs-esp-dev}/overlay.nix")
        ];
        config = { allowUnfree = true; };
      };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            gcc-xtensa-esp32-elf-bin
            esp-idf
            esptool

            # Tools required to use ESP-IDF.
            git
            wget
            gnumake

            flex
            bison
            gperf
            pkgconfig

            cmake
            ninja

            ncurses5
          ];
        };
      });
}
