{nixpkgs-esp-dev, pkgs, nixpkgs}:
let
  pkgs = nixpkgs { overlays = [ (import "${nixpkgs-esp-dev}/overlay.nix") ]; };
in
pkgs.mkShell {
  name = "esp-project";

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
}
