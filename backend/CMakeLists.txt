cmake_minimum_required(VERSION 3.18)
project(mh8a_backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(EXECUTABLE_OUTPUT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/bin)
set(LIBRARY_OUTPUT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_CURRENT_SOURCE_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_CURRENT_SOURCE_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/bin)
set(CMAKE_OBJECT_PATH_MAX 2048)
set(CMAKE_INSTALL_PLUGINS ${CMAKE_INSTALL_BINDIR}/Plugins)
set(CMAKE_DEBUG_POSTFIX d)


find_package(Drogon CONFIG REQUIRED)
find_package(Trantor CONFIG REQUIRED)
find_package(libmodbus CONFIG REQUIRED)

add_executable(mh8a_backend
  src/main.cpp
  src/ModbusService.cpp
  src/BroadcastHub.cpp
  src/ConfigController.cpp
  src/TelemetryWs.cpp
  src/ConfigStorage.cpp
)

target_include_directories(mh8a_backend PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(mh8a_backend PRIVATE Drogon::Drogon Trantor::Trantor modbus)

# Enable extra warnings in dev builds
if (MSVC)
  target_compile_options(mh8a_backend PRIVATE /W4 /permissive-)
else ()
  target_compile_options(mh8a_backend PRIVATE -Wall -Wextra -Wpedantic)
endif ()
