#include "TelemetryWs.h"
#include "BroadcastHub.h"
#include <json/json.h>

std::shared_ptr<BroadcastHub> TelemetryWs::hub_{};


TelemetryWs::TelemetryWs() {

}


TelemetryWs::~TelemetryWs() {

}

void TelemetryWs::setHub(std::shared_ptr<BroadcastHub> hub) {
	hub_ = std::move(hub);
}

void TelemetryWs::handleNewConnection(const drogon::HttpRequestPtr&,
	const drogon::WebSocketConnectionPtr& conn) {
	if (hub_) {
		hub_->addClient(conn);
	}
}

void TelemetryWs::handleConnectionClosed(const drogon::WebSocketConnectionPtr& conn) {
	if (hub_) {
		hub_->removeClient(conn);
	}
}

void TelemetryWs::handleNewMessage(const drogon::WebSocketConnectionPtr& conn,
	std::string&& message,
	const drogon::WebSocketMessageType& type) {
	(void)conn;
	(void)message;
	(void)type;
}


