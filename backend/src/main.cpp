#include "BroadcastHub.h"
#include "ConfigController.h"
#include "ModbusService.h"
#include "TelemetryWs.h"
#include "ConfigStorage.h"
#include <drogon/drogon.h>
#include <filesystem>

int main(int argc, char *argv[]) {
  ConfigStorage storage("config/modbus.json");
  ModbusConfig initial{};
  initial.host = "127.0.0.1";
  initial.port = 502;
  initial.slaveId = 1;
  initial.intervalMs = 100;
  initial = storage.loadOrDefault(initial);

  auto hub = std::make_shared<BroadcastHub>();
  auto modbus = std::make_shared<ModbusService>(hub, initial);
  TelemetryWs::setHub(hub);

  ConfigController::registerRoutes(modbus, hub, storage);

  drogon::app()
      .addListener("0.0.0.0", 8088)
      .setThreadNum(std::thread::hardware_concurrency())
      .registerBeginningAdvice([modbus]() { modbus->start(); })
      .run();
   
  return 0;
}
