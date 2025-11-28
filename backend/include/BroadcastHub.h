#pragma once

#include <drogon/HttpAppFramework.h>
#include <drogon/WebSocketConnection.h>
#include <mutex>
#include <vector>

struct TelemetrySnapshot;

// Simple broadcaster that fans out telemetry to WebSocket clients.
class BroadcastHub {
public:
  void addClient(const drogon::WebSocketConnectionPtr &conn);
  void removeClient(const drogon::WebSocketConnectionPtr &conn);
  void broadcast(const TelemetrySnapshot &snapshot, bool connected);

private:
  std::mutex mutex_;
  std::vector<std::weak_ptr<drogon::WebSocketConnection>> clients_;
};
