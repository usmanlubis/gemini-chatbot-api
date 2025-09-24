const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const messages = [];

form.addEventListener('submit', async function (e) {
	e.preventDefault();

	const userMessage = input.value.trim();
	if (!userMessage) return;

	// Add user message to chat and history
	addMessageToChat('user', userMessage);
	messages.push({ role: 'user', content: userMessage });
	input.value = '';

	// Show a thinking indicator and get a reference to it
	const thinkingMessageElement = addMessageToChat('bot', 'Thinking...');

	try {
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				// The backend expects the full conversation history
				messages: messages,
			}),
		});

		if (!res.ok) {
			throw new Error('Failed to get response from server.');
		}

		const data = await res.json();
		const botMessage = data.result;

		if (botMessage) {
			// Update the "Thinking..." message with the actual response
			thinkingMessageElement.innerHTML = formatMessage(botMessage);
			// Add the bot's response to the history
			messages.push({ role: 'model', content: botMessage });
		} else {
			thinkingMessageElement.textContent = 'Sorry, no response received.';
		}
	} catch (error) {
		console.error('Error:', error);
		thinkingMessageElement.textContent = 'Failed to get response from server.';
	} finally {
		// Ensure the chatbox scrolls to the bottom after the response is rendered
		chatBox.scrollTop = chatBox.scrollHeight;
	}
});

function addMessageToChat(sender, text) {
	const msg = document.createElement('div');
	msg.classList.add('message', sender);

	const msgContent = document.createElement('div');
    msgContent.classList.add('message-content');
    msgContent.innerHTML = formatMessage(text);

    msg.appendChild(msgContent);
	chatBox.appendChild(msg);
	chatBox.scrollTop = chatBox.scrollHeight;
	return msgContent; // Return the content element to allow for later updates
}

function formatMessage(text) {
	// Convert **bold** to <b>bold</b>
	return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}
