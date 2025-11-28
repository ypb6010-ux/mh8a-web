#include "ConfigController.h"
#include "BroadcastHub.h"
#include "ModbusService.h"
#include "ConfigStorage.h"
#include <drogon/HttpAppFramework.h>
#include <drogon/drogon.h>

using drogon::HttpResponsePtr;
using drogon::HttpStatusCode;
using drogon::HttpRequestPtr;
using drogon::HttpResponse;

namespace {
	Json::Value toJson(const ModbusConfig& cfg) {
		Json::Value root;
		root["host"] = cfg.host;
		root["port"] = cfg.port;
		root["slaveId"] = cfg.slaveId;
		root["intervalMs"] = cfg.intervalMs;
		return root;
	}

	Json::Value toJson(const TelemetrySnapshot& snap) {
		Json::Value root;
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

void ConfigController::registerRoutes(const std::shared_ptr<ModbusService>& modbus, const std::shared_ptr<BroadcastHub>& /*hub*/, ConfigStorage &storage) {
	drogon::app().registerHandler(
		"/api/modbus/config",
		[modbus,&storage](const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& cb) {
			if (req->getMethod() == drogon::Post) {
				auto json = req->getJsonObject();
				if (!json) {
					auto resp = HttpResponse::newHttpJsonResponse(Json::Value("invalid json"));
					resp->setStatusCode(HttpStatusCode::k400BadRequest);
					cb(resp);
					return;
				}
				ModbusConfig cfg = modbus->getConfig();
				if (json->isMember("host")) cfg.host = (*json)["host"].asString();
				if (json->isMember("port")) cfg.port = (*json)["port"].asInt();
				if (json->isMember("slaveId")) cfg.slaveId = (*json)["slaveId"].asInt();
				if (json->isMember("slaveID")) cfg.slaveId = (*json)["slaveID"].asInt(); // tolerate camel/pascal
				if (json->isMember("intervalMs")) cfg.intervalMs = (*json)["intervalMs"].asInt();
				if (json->isMember("interval")) cfg.intervalMs = (*json)["interval"].asInt();
				modbus->updateConfig(cfg);
				storage.save(cfg);
			}
			auto resp = HttpResponse::newHttpJsonResponse(toJson(modbus->getConfig()));
			cb(resp);
		},
		{ drogon::Get, drogon::Post });

	drogon::app().registerHandler(
		"/api/modbus/telemetry",
		[modbus](const HttpRequestPtr&, std::function<void(const HttpResponsePtr&)>&& cb) {
			auto resp = HttpResponse::newHttpJsonResponse(toJson(modbus->latest()));
			cb(resp);
		},
		{ drogon::Get });
}
