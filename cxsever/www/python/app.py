"""
Flask application for HTML processing service.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from lib.processor import process_html


app = Flask(__name__)
CORS(app)


@app.route('/textp', methods=['POST'])
def process_text():
    """
    Process HTML text through the CX pipeline.
    
    Expected POST body:
        {
            "html": "<html>...</html>"
        }
    
    Returns:
        JSON response with processed HTML or error message
    """
    try:
        data = request.get_json()
        source_html = data.get('html', '')
        
        if not source_html or not source_html.strip():
            return jsonify({
                'result': 'Content for translate is not given or is empty'
            }), 500
        
        processed_text = process_html(source_html)
        return jsonify({'result': processed_text})
    
    except Exception as error:
        print(f"Error processing HTML: {error}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'result': str(error)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
