{
  description = "ESP8266/ESP32 development tools";

  inputs = {
    nixpkgs.url = "nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs-esp-dev.url = "github:mirrexagon/nixpkgs-esp-dev";
    mach-nix.url = "github:DavHau/mach-nix";
  };

  outputs = { self, nixpkgs, flake-utils, nixpkgs-esp-dev, mach-nix }: {
    
  } // flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
    let
      pkgsNoOverlay = import nixpkgs {
        inherit system;
      };
      overlay = (import ./overlay.nix { inherit nixpkgs-esp-dev; mach-nix = import mach-nix {
         pypiDataRev = "be6591698c67a86a69c81fef72167e38d038a9fc";
        pypiDataSha256 = "sha256:078i0af4s1la5cafq958wfk8as711qlf81ngrg0xq0wys7ainig1";
       
        # providers = [ "conda" "wheel" "sdist" "nixpkgs" ];
        pkgs = pkgsNoOverlay;
        #  python = "python310";
      }; });
      pkgs = import nixpkgs { inherit system; overlays = [ overlay ]; };
    in
    {
      # packages = {
      #   inherit (pkgs)
      #     gcc-riscv32-esp32c3-elf-bin
      #     gcc-xtensa-esp32-elf-bin
      #     gcc-xtensa-esp32s2-elf-bin
      #     openocd-esp32-bin
      #     esp-idf

      #     gcc-xtensa-lx106-elf-bin
      #     crosstool-ng-xtensa
      #     gcc-xtensa-lx106-elf;
      # };

      devShells = {
       default = import "${nixpkgs-esp-dev}/shells/esp32-idf.nix" { inherit pkgs; };
      };
    });
}
