# When updating to a newer version, check if the version of `esp32-toolchain-bin.nix` also needs to be updated.
{ rev ? "v4.4.1"
, sha256 ? "sha256-4dAGcJN5JVV9ywCOuhMbdTvlJSCrJdlMV6wW06xcrys="
, stdenv
, lib
, fetchFromGitHub
, mach-nix
, pkgs
}:

let
  src = fetchFromGitHub {
    owner = "espressif";
    repo = "esp-idf";
    rev = rev;
    sha256 = sha256;
    fetchSubmodules = true;
  };

  pythonEnv =
    let
      # Remove things from requirements.txt that aren't necessary and mach-nix can't parse:
      # - Comment out Windows-specific "file://" line.
      # - Comment out ARMv7-specific "--only-binary" line.
      requirementsOriginalText = builtins.readFile "${src}/requirements.txt";
      requirementsText = builtins.replaceStrings
        [ "file://" "--only-binary" ]
        [ "#file://" "#--only-binary" ]
        requirementsOriginalText;
    in
    (( builtins.trace "ddd " mach-nix).mkPython)
      {
        #requirements = builtins.trace "reqs: ${requirementsText}" requirementsText;
        requirements = "
 # This is a list of python packages needed for ESP-IDF. This file is used with pip.
# Please see the Get Started section of the ESP-IDF Programming Guide for further information.
#
# setuptools>=21
# The setuptools package is required to install source distributions and on some systems is not installed by default.
# Please keep it as the first item of this list. Version 21 is required to handle PEP 508 environment markers.
#
click>=7.0
pyserial>=3.3
future>=0.15.2

cryptography>=2.1.4
#--only-binary cryptography
# Only binary for cryptography is here to make it work on ARMv7 architecture
# We do have cryptography binary on https://dl.espressif.com/pypi for ARM
# On https://pypi.org/ are no ARM binaries as standard now

pyparsing>=2.0.3,<2.4.0
pyelftools>=0.22
# idf-component-manager~=1.0

gdbgui==0.13.2.0
# 0.13.2.1 supports Python 3.6+ only
# Windows is not supported since 0.14.0.0. See https://github.com/cs01/gdbgui/issues/348
pygdbmi<=0.9.0.2
# The pygdbmi required max version 0.9.0.2 since 0.9.0.3 is not compatible with latest gdbgui (>=0.13.2.0)
# A compatible Socket.IO should be used. See https://github.com/miguelgrinberg/python-socketio/issues/578
python-socketio<5
jinja2<3.1  # See https://github.com/espressif/esp-idf/issues/8760
itsdangerous<2.1

kconfiglib==13.7.1

# esptool requirements (see components/esptool_py/esptool/setup.py)
reedsolo>=1.5.3,<=1.5.4
bitstring>=3.1.6
ecdsa>=0.16.0

# espcoredump requirements
# This is the last version supports both 2.7 and 3.4
construct==2.10.54
";
      };
in
stdenv.mkDerivation rec {
  pname = "esp-idf";
  version = rev;

  inherit src;

  # This is so that downstream derivations will have IDF_PATH set.
  setupHook = ./setup-hook.sh;

  propagatedBuildInputs = [
    # This is so that downstream derivations will run the Python setup hook and get PYTHONPATH set up correctly.
    pythonEnv.python
    # setuptools
    pkgs.python3Packages.setuptools
  ];

  installPhase = ''
    mkdir -p $out
    cp -r $src/* $out/
    # Link the Python environment in so that in shell derivations, the Python
    # setup hook will add the site-packages directory to PYTHONPATH.
    ln -s ${pythonEnv}/lib $out/
  ''; # 
}
