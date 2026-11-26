from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__)

# Simple processing function – you can replace this with your own logic.
def process_input(user_input: str) -> str:
    """Return a transformed version of the input.
    Currently just echoes the input in uppercase.
    """
    return user_input.upper()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process', methods=['POST'])
def api_process():
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({'error': 'No input provided'}), 400
    user_input = data['input']
    result = process_input(user_input)
    return jsonify({'result': result})

if __name__ == '__main__':
    # Use host 0.0.0.0 to be reachable from outside the sandbox if needed.
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
