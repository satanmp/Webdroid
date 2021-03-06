package com.wantflying.server;

import java.io.IOException;

import com.wantflying.server.WebSocketFrame.CloseCode;

public class WebSocketException extends IOException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private CloseCode code;
    private String reason;

    public WebSocketException(Exception cause) {
        this(CloseCode.InternalServerError, cause.toString(), cause);
    }

    public WebSocketException(CloseCode code, String reason) {
        this(code, reason, null);
    }

    public WebSocketException(CloseCode code, String reason, Exception cause) {
        super(code + ": " + reason, cause);
        this.code = code;
        this.reason = reason;
    }

    public CloseCode getCode() {
        return code;
    }

    public String getReason() {
        return reason;
    }
}