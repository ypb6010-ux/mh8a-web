#pragma once

#include <drogon/HttpAppFramework.h>
#include <trantor/net/EventLoop.h>
#include <modbus/modbus.h>
#include <mutex>
#include <string>
#include <cstdint>

struct ModbusConfig {
	std::string host{ "127.0.0.1" };
	int port{ 503 };
	int slaveId{ 1 };
	int intervalMs{ 100 };
};

struct TelemetrySnapshot {
	double ia{ 0.0 };
	double ib{ 0.0 };
	double ic{ 0.0 };
	double us{ 0.0 };
	double rj{ 0.0 };
	double gas{ 0.0 };
	double tempMachine{ 0.0 };
	double tempOil{ 0.0 };
	double flow{ 0.0 };
	double level{ 0.0 };
	int faultCode{ 0 };
	bool breakerClosed{ false };
	int year{ 0 }, month{ 0 }, day{ 0 }, hour{ 0 }, minute{ 0 }, second{ 0 }, week{ 0 };
	double ratedVoltage{ 0.0 };
	double ratedCurrent{ 0.0 };
	double shortCircuitFactor{ 0.0 };
	double methane{ 0.0 };
};

class BroadcastHub;

class ModbusService {
public:
	explicit ModbusService(std::shared_ptr<BroadcastHub> hub, ModbusConfig initial = {});
	~ModbusService();

	void start();
	void stop();

	void updateConfig(const ModbusConfig& cfg);
	ModbusConfig getConfig() const;

	TelemetrySnapshot latest() const;

private:
	void pollOnce();
	void schedule();
	bool ensureConnection();
	void disconnect();
	bool isConnected() const;
	void notifyConnectionChange();

	std::shared_ptr<BroadcastHub> hub_;
	ModbusConfig config_;
	mutable std::mutex mutex_;
	TelemetrySnapshot last_{};
	uint64_t timerId_{ 0 };
	modbus_t* ctx_{ nullptr };
	bool connected_{ false };
	bool announcedConnected_{ false };
	bool connectFailLogged_{ false };
};
