
function print_d(message) {
	fetch('http://localhost:8001/debug', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message: String(message)
		})
	}).catch(function(err) {
		console.error('Failed to send debug message:', err);
	});
}

export default print_d;
