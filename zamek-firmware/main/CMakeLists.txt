idf_component_register(SRCS "main.cpp" "Storage.cpp"
                    INCLUDE_DIRS "")
set (CMAKE_CXX_STANDARD 17)
target_compile_options(${COMPONENT_LIB} PRIVATE "-Wno-format")
