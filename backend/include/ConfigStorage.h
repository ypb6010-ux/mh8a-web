#pragma once

#include "ModbusService.h"
#include <string>

class ConfigStorage {
public:
  explicit ConfigStorage(std::string path);

  ModbusConfig loadOrDefault(const ModbusConfig &fallback);
  bool save(const ModbusConfig &cfg);

private:
  std::string path_;
};
