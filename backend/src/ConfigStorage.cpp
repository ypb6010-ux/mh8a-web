#include "ConfigStorage.h"
#include <json/json.h>
#include <filesystem>
#include <fstream>

ConfigStorage::ConfigStorage(std::string path) : path_(std::move(path)) {}

ModbusConfig ConfigStorage::loadOrDefault(const ModbusConfig &fallback) {
  namespace fs = std::filesystem;
  if (!fs::exists(path_)) {
    save(fallback);
    return fallback;
  }
  std::ifstream in(path_, std::ios::in);
  if (!in.good()) {
    return fallback;
  }
  Json::Value root;
  in >> root;
  ModbusConfig cfg = fallback;
  if (root.isMember("host")) cfg.host = root["host"].asString();
  if (root.isMember("port")) cfg.port = root["port"].asInt();
  if (root.isMember("slaveId")) cfg.slaveId = root["slaveId"].asInt();
  if (root.isMember("intervalMs")) cfg.intervalMs = root["intervalMs"].asInt();
  return cfg;
}

bool ConfigStorage::save(const ModbusConfig &cfg) {
  namespace fs = std::filesystem;
  try {
    fs::create_directories(fs::path(path_).parent_path());
  } catch (...) {
  }
  Json::Value root;
  root["host"] = cfg.host;
  root["port"] = cfg.port;
  root["slaveId"] = cfg.slaveId;
  root["intervalMs"] = cfg.intervalMs;

  std::ofstream out(path_, std::ios::out | std::ios::trunc);
  if (!out.good()) return false;
  out << root;
  return true;
}
