(function() {

		var ws_conn = null;
		
		
		ws_conn = new WebSocket( "ws://27.90.199.106/dx/socket.io" );
		
		ws_conn.onopen = function() {
			console.log("Success");
			
			var auth_obj = { type: "user-auth-request",
										user: "uhero",
										pass: "Passw0rd" };
			
			var message = JSON.stringify( auth_obj );
			
			ws_conn.send( message );
		}
		
		ws_conn.onerror = function (error) {
		  console.log(error);
		};
		
		ws_conn.onmessage = function (e) {
		  console.log('Server: ' + e.data);
		};
		
})();