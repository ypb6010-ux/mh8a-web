#include "BroadcastHub.h"
#include "ModbusService.h"
#include <json/json.h>

namespace {
	Json::Value toJson(const TelemetrySnapshot& snap, bool connected) {
		Json::Value root;
		root["connected"] = connected;
		root["ia"] = snap.ia;
		root["ib"] = snap.ib;
		root["ic"] = snap.ic;
		root["us"] = snap.us;
		root["rj"] = snap.rj;
		root["gas"] = snap.gas;
		root["tempMachine"] = snap.tempMachine;
		root["tempOil"] = snap.tempOil;
		root["flow"] = snap.flow;
		root["level"] = snap.level;
		root["faultCode"] = snap.faultCode;
		root["breakerClosed"] = snap.breakerClosed;
		root["week"] = snap.week;
		root["year"] = snap.year;
		root["month"] = snap.month;
		root["day"] = snap.day;
		root["hour"] = snap.hour;
		root["minute"] = snap.minute;
		root["second"] = snap.second;
		root["ratedVoltage"] = snap.ratedVoltage;
		root["ratedCurrent"] = snap.ratedCurrent;
		root["shortCircuitFactor"] = snap.shortCircuitFactor;
		root["methane"] = snap.methane;
		return root;
	}
} // namespace

void BroadcastHub::addClient(const drogon::WebSocketConnectionPtr& conn) {
	std::lock_guard<std::mutex> lock(mutex_);
	clients_.push_back(conn);
}

void BroadcastHub::removeClient(const drogon::WebSocketConnectionPtr& conn) {
	std::lock_guard<std::mutex> lock(mutex_);
	clients_.erase(std::remove_if(clients_.begin(), clients_.end(),
		[&conn](const auto& weak) {
			auto locked = weak.lock();
			return !locked || locked == conn;
		}),
		clients_.end());
}

void BroadcastHub::broadcast(const TelemetrySnapshot& snapshot, bool connected) {
	Json::StreamWriterBuilder builder;
	builder["omitEndingLineFeed"] = true;
	const auto payload = Json::writeString(builder, toJson(snapshot, connected));

	std::lock_guard<std::mutex> lock(mutex_);
	for (auto it = clients_.begin(); it != clients_.end();) {
		if (auto conn = it->lock()) {
			conn->send(payload);
			++it;
		}
		else {
			it = clients_.erase(it);
		}
	}
}
