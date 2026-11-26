document.getElementById('sendBtn').addEventListener('click', async () => {
    const input = document.getElementById('userInput').value.trim();
    if (!input) {
        setOutput('Please enter some text.');
        return;
    }
    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
        });
        const data = await response.json();
        if (response.ok) {
            setOutput(data.result);
        } else {
            setOutput('Error: ' + (data.error || 'unknown'));
        }
    } catch (err) {
        setOutput('Network error: ' + err.message);
    }
});

function setOutput(text) {
    const out = document.getElementById('output');
    out.textContent = text;
}
