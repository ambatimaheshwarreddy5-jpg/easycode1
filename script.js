const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let messages = [];

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = '52px';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send on Enter (but allow Shift+Enter for new lines)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage('user', text);
    messages.push({ role: 'user', content: text });
    
    userInput.value = '';
    userInput.style.height = '52px';
    
    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        const data = await response.json();
        
        // Remove typing indicator
        removeElement(typingId);

        if (response.ok) {
            messages.push({ role: 'model', content: data.reply });
            appendMessage('assistant', data.reply);
        } else {
            appendMessage('assistant', 'Error: ' + (data.error || 'Something went wrong.'));
        }
    } catch (err) {
        removeElement(typingId);
        appendMessage('assistant', 'Network error. Please check if the backend is running.');
    }
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Parse markdown if it's the assistant
    if (role === 'assistant') {
        contentDiv.innerHTML = marked.parse(text);
    } else {
        contentDiv.textContent = text;
    }
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant';
    msgDiv.id = id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content typing-indicator';
    
    contentDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    
    scrollToBottom();
    return id;
}

function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}
