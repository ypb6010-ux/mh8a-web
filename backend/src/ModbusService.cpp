#include "ModbusService.h"
#include "BroadcastHub.h"
#include <chrono>
#include <modbus/modbus.h>
#include <cerrno>

ModbusService::ModbusService(std::shared_ptr<BroadcastHub> hub, ModbusConfig initial)
    : hub_(std::move(hub)), config_(std::move(initial)) {}

ModbusService::~ModbusService() {
	stop();
	disconnect();
}

void ModbusService::start() {
	schedule();
}

void ModbusService::stop() {
	if (timerId_ != 0) {
		drogon::app().getLoop()->invalidateTimer(timerId_);
		timerId_ = 0;
	}
}

void ModbusService::updateConfig(const ModbusConfig& cfg) {
	{
		std::lock_guard<std::mutex> lock(mutex_);
		config_ = cfg;
	}
	stop();
	disconnect();
	schedule();
}

ModbusConfig ModbusService::getConfig() const {
	std::lock_guard<std::mutex> lock(mutex_);
	return config_;
}

TelemetrySnapshot ModbusService::latest() const {
	std::lock_guard<std::mutex> lock(mutex_);
	return last_;
}

void ModbusService::schedule() {
	auto loop = drogon::app().getLoop();
	auto period = std::chrono::milliseconds(getConfig().intervalMs);
	timerId_ = loop->runEvery(
		static_cast<double>(period.count()) / 1000.0,
		[this]() { pollOnce(); });
}

void ModbusService::pollOnce() {
	if (!ensureConnection()) {
		return;
	}

	uint16_t regs[32] = { 0 };
	const int startAddr = 0;
	const int count = 23;
	{
		std::lock_guard<std::mutex> lock(mutex_);
		int rc = modbus_read_registers(ctx_, startAddr, count, regs);
		if (rc != count) {
			if (connected_) {
				LOG_WARN << "modbus_read_registers failed rc=" << rc << " errno=" << modbus_strerror(errno);
			}
			disconnect();
			return;
		}
	}

	auto scale = [](uint16_t raw, double factor) { return static_cast<double>(raw) * factor; };

	TelemetrySnapshot snap{};
	snap.ia = scale(regs[0], 1.0);
	snap.ib = scale(regs[1], 1.0);
	snap.ic = scale(regs[2], 1.0);
	snap.us = scale(regs[3], 1.0);
	snap.rj = scale(regs[4], 1.0);
	snap.gas = scale(regs[5], 1.0);
	snap.tempMachine = scale(regs[6], 1.0);
	snap.tempOil = scale(regs[7], 1.0);
	snap.flow = scale(regs[8], 1.0);
	snap.level = scale(regs[9], 1.0);
	snap.faultCode = static_cast<int>(regs[10]);
	snap.breakerClosed = regs[11] != 0;
	snap.week = static_cast<int>(regs[12]);
	snap.year = static_cast<int>(regs[13]);
	snap.month = static_cast<int>(regs[14]);
	snap.day = static_cast<int>(regs[15]);
	snap.hour = static_cast<int>(regs[16]);
	snap.minute = static_cast<int>(regs[17]);
	snap.second = static_cast<int>(regs[18]);
	snap.ratedVoltage = scale(regs[19], 1.0);
	snap.ratedCurrent = scale(regs[20], 1.0);
	snap.shortCircuitFactor = scale(regs[21], 1.0);
	snap.methane = scale(regs[22], 0.01); // docs: *0.01

	{
		std::lock_guard<std::mutex> lock(mutex_);
		last_ = snap;
	}

	if (hub_) {
		hub_->broadcast(snap, isConnected());
	}
	notifyConnectionChange();
}

bool ModbusService::ensureConnection() {
	if (ctx_) {
		return true;
	}
	ModbusConfig cfg = getConfig();
	ctx_ = modbus_new_tcp(cfg.host.c_str(), cfg.port);
	if (!ctx_) {
		LOG_ERROR << "modbus_new_tcp failed";
		connected_ = false;
		last_ = TelemetrySnapshot{};
		notifyConnectionChange();
		return false;
	}
	modbus_set_error_recovery(ctx_, static_cast<modbus_error_recovery_mode>(MODBUS_ERROR_RECOVERY_LINK | MODBUS_ERROR_RECOVERY_PROTOCOL));
	modbus_set_response_timeout(ctx_, 0, cfg.intervalMs * 1000);
	if (modbus_set_slave(ctx_, cfg.slaveId) == -1) {
		LOG_ERROR << "modbus_set_slave failed: " << modbus_strerror(errno);
		disconnect();
		last_ = TelemetrySnapshot{};
		notifyConnectionChange();
		return false;
	}
	if (modbus_connect(ctx_) == -1) {
		if (!connectFailLogged_) {
			LOG_ERROR << "modbus_connect failed: " << modbus_strerror(errno);
			connectFailLogged_ = true;
		}
		disconnect();
		last_ = TelemetrySnapshot{};
		notifyConnectionChange();
		return false;
	}
	connected_ = true;
	connectFailLogged_ = false;
	notifyConnectionChange();
	return true;
}

void ModbusService::disconnect() {
	if (ctx_) {
		modbus_close(ctx_);
		modbus_free(ctx_);
		ctx_ = nullptr;
	}
	connected_ = false;
	last_ = TelemetrySnapshot{};
	notifyConnectionChange();
}

void ModbusService::notifyConnectionChange() {
	if (!hub_) return;
	if (connected_ != announcedConnected_) {
		announcedConnected_ = connected_;
		hub_->broadcast(last_, connected_);
		if (connected_) {
			LOG_INFO << "Modbus connected";
		}
		else {
			LOG_WARN << "Modbus disconnected";
		}
	}
}

bool ModbusService::isConnected() const {
	return connected_;
}
