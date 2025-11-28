#pragma once

#include <memory>

class BroadcastHub;
class ModbusService;
class ConfigStorage;

namespace ConfigController {
void registerRoutes(const std::shared_ptr<ModbusService> &modbus,
                    const std::shared_ptr<BroadcastHub> &hub,
                    ConfigStorage &storage);
}
