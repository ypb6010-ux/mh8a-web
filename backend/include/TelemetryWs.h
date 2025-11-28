#pragma once

#include <drogon/WebSocketController.h>
#include <memory>

class BroadcastHub;

class TelemetryWs : public drogon::WebSocketController<TelemetryWs> {
public:
	TelemetryWs();
	~TelemetryWs();
	static void setHub(std::shared_ptr<BroadcastHub> hub);

	void handleNewConnection(const drogon::HttpRequestPtr& req,
		const drogon::WebSocketConnectionPtr& conn) override;
	void handleConnectionClosed(const drogon::WebSocketConnectionPtr& conn) override;

	void handleNewMessage(const drogon::WebSocketConnectionPtr& conn,
		std::string&& message,
		const drogon::WebSocketMessageType& type) override;
	WS_PATH_LIST_BEGIN
		WS_PATH_ADD("/ws/telemetry");
	WS_PATH_LIST_END

private:
	static std::shared_ptr<BroadcastHub> hub_;
};
