

set(SRCS
    "main.cpp"
    "Storage.cpp"
    "App.cpp"
    "Config.cpp"
    "NetworkManager.cpp"
    "Util.cpp"
)

idf_component_register(SRCS ${SRCS}
    INCLUDE_DIRS "")

set(CMAKE_CXX_STANDARD 17)
component_compile_options(-std=gnu++17)

include(FetchContent)

FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)

target_link_libraries(${COMPONENT_LIB} PRIVATE nlohmann_json::nlohmann_json stdc++)

target_compile_options(${COMPONENT_LIB} PRIVATE "-Wno-format")
