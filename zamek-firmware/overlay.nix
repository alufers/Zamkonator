{nixpkgs-esp-dev, mach-nix} :final: prev:
let
  # mach-nix is used to set up the ESP-IDF Python environment.
#   mach-nix-src = prev.fetchFromGitHub {
#     owner = "DavHau";
#     repo = "mach-nix";
#     rev = "3.5.0";
#     hash = "sha256-SXrwF/KPz8McBN8kN+HTfGphE1hiRSr1mtXSVjPJr8o=";
#   };

#   mach-nix = import mach-nix-src {
#     pypiDataRev = "be6591698c67a86a69c81fef72167e38d038a9fc";
#     pypiDataSha256 = "sha256:078i0af4s1la5cafq958wfk8as711qlf81ngrg0xq0wys7ainig1";
#     pkgs = final;
#     providers = [ "conda" "wheel" "sdist" "nixpkgs" ];
#   };
in
{
  # ESP32C3
  gcc-riscv32-esp32c3-elf-bin = prev.callPackage "${nixpkgs-esp-dev}/pkgs/esp32c3-toolchain-bin.nix" { };
  # ESP32S2
  gcc-xtensa-esp32s2-elf-bin = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/esp32s2-toolchain-bin.nix" { };
  # ESP32
  gcc-xtensa-esp32-elf-bin = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/esp32-toolchain-bin.nix" { };
  openocd-esp32-bin = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/openocd-esp32-bin.nix" { };

  esp-idf = prev.callPackage ( import ./esp-idf/default.nix) { 
    rev = "v4.4.2";
    pkgs = prev;
    inherit mach-nix;
  };

  # ESP8266
  gcc-xtensa-lx106-elf-bin = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/esp8266-toolchain-bin.nix" { };

  # Note: These are currently broken in flake mode because they fetch files
  # during the build, making them impure.
  crosstool-ng-xtensa = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/crosstool-ng-xtensa.nix" { };
  gcc-xtensa-lx106-elf = prev.callPackage  "${nixpkgs-esp-dev}/pkgs/gcc-xtensa-lx106-elf" { };
}
