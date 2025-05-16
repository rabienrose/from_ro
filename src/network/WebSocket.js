function Socket( host, port, proxy, onComplete, onMessage, onClose )
{
	var url            = 'ws://' + host + ':' + port + '/';
	this.connected     = false;
	this.onComplete    = onComplete;
	this.onMessage     = onMessage;
	this.onClose       = onClose;
	var self = this;

	// Use of a proxy
	if (proxy) {
		url = proxy;

		if (!url.match(/\/$/)) {
			url += '/';
		}

		url += host + ':' + port;
	}
	
	this.ws            = new WebSocket(url);
	this.ws.binaryType = 'arraybuffer';

	this.ws.onopen = function OnOpen()
	{
		self.connected = true;
		self.onComplete( true );
	};

	this.ws.onerror = function OnError()
	{
		if (!self.connected) {
			self.onComplete( false );
		}
	};

	this.ws.onmessage = function OnMessage( event )
	{
		self.onMessage( event.data ); 
	};

	this.ws.onclose = function OnClose()
	{
		self.connected = false;
		this.close();

		if (self.onClose) {
			self.onClose();
		}
	};
}

Socket.prototype.send = function Send( buffer )
{
	if (this.connected) {
		this.ws.send( buffer );
	}
};

Socket.prototype.close = function Close()
{
	if (this.connected) {
		this.ws.close();
		this.connected = false;
	}
};

export default Socket;
