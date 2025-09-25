#!/usr/bin/env python3
"""
AI Text Humanizer - Simplified Version for Deployment
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import re
import random

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Simple text transformation functions
def expand_contractions(text):
    """Expand contractions in text"""
    contractions = {
        "don't": "do not", "doesn't": "does not", "didn't": "did not",
        "won't": "will not", "can't": "cannot", "couldn't": "could not",
        "wouldn't": "would not", "shouldn't": "should not", "mustn't": "must not",
        "isn't": "is not", "aren't": "are not", "wasn't": "was not",
        "weren't": "were not", "hasn't": "has not", "haven't": "have not",
        "hadn't": "had not",
        "I'm": "I am", "you're": "you are", "he's": "he is", "she's": "she is",
        "we're": "we are", "they're": "they are", "I'll": "I will",
        "you'll": "you will", "he'll": "he will", "she'll": "she will",
        "we'll": "we will", "they'll": "they will", "I've": "I have",
        "you've": "you have", "we've": "we have", "they've": "they have",
        "I'd": "I would", "you'd": "you would", "he'd": "he would",
        "she'd": "she would", "we'd": "we would", "they'd": "they would",
        "it's": "it is", "that's": "that is", "there's": "there is",
        "here's": "here is", "what's": "what is", "who's": "who is",
        "where's": "where is", "when's": "when is", "why's": "why is",
        "how's": "how is"
    }
    
    result = text
    for contraction, expansion in contractions.items():
        pattern = r'\b' + re.escape(contraction) + r'\b'
        result = re.sub(pattern, expansion, result, flags=re.IGNORECASE)
    return result

def add_transitions(text):
    """Add academic transitions"""
    transitions = [
        "Moreover,", "Additionally,", "Furthermore,", "Hence,", 
        "Therefore,", "Consequently,", "Nonetheless,", "Nevertheless,"
    ]
    
    sentences = text.split('. ')
    if len(sentences) > 1:
        for i in range(1, len(sentences)):
            if random.random() < 0.3:
                transition = random.choice(transitions)
                sentences[i] = f"{transition} {sentences[i]}"
    return '. '.join(sentences)

def replace_synonyms(text):
    """Replace words with synonyms"""
    synonyms = {
        "good": "excellent", "bad": "poor", "big": "significant", "small": "minimal",
        "important": "crucial", "easy": "straightforward", "hard": "challenging",
        "help": "assist", "use": "utilize", "get": "obtain", "make": "create",
        "show": "demonstrate", "tell": "inform", "ask": "inquire", "try": "attempt",
        "start": "commence", "end": "conclude", "find": "discover", "know": "understand"
    }
    
    result = text
    for word, synonym in synonyms.items():
        pattern = r'\b' + re.escape(word) + r'\b'
        if random.random() < 0.3:
            result = re.sub(pattern, synonym, result, flags=re.IGNORECASE)
    return result

def convert_to_passive(text):
    """Convert some sentences to passive voice"""
    sentences = text.split('. ')
    passive_sentences = []
    
    for sentence in sentences:
        if random.random() < 0.2:
            sentence = sentence.replace("I do", "It is done by me")
            sentence = sentence.replace("we can", "it can be done by us")
            sentence = sentence.replace("you should", "it should be done by you")
        passive_sentences.append(sentence)
    
    return '. '.join(passive_sentences)

def humanize_text(text, use_passive=False, use_synonyms=False):
    """Main text humanization function"""
    result = text
    
    # Always expand contractions
    result = expand_contractions(result)
    
    # Always add transitions
    result = add_transitions(result)
    
    # Apply optional transformations
    if use_passive:
        result = convert_to_passive(result)
    
    if use_synonyms:
        result = replace_synonyms(result)
    
    return result

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/api/transform', methods=['POST'])
def transform_text():
    """API endpoint for text transformation"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        # Get options from request
        use_passive = data.get('use_passive', False)
        use_synonyms = data.get('use_synonyms', False)
        
        # Transform text
        transformed = humanize_text(text, use_passive, use_synonyms)
        
        # Calculate statistics
        input_words = len(text.split())
        input_sentences = len([s for s in text.split('.') if s.strip()])
        output_words = len(transformed.split())
        output_sentences = len([s for s in transformed.split('.') if s.strip()])
        
        return jsonify({
            'success': True,
            'transformed_text': transformed,
            'statistics': {
                'input_words': input_words,
                'input_sentences': input_sentences,
                'output_words': output_words,
                'output_sentences': output_sentences
            },
            'options_used': {
                'use_passive': use_passive,
                'use_synonyms': use_synonyms
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Transformation failed: {str(e)}'
        }), 500

@app.route('/api/sample', methods=['GET'])
def get_sample_text():
    """Get sample text for testing"""
    sample_texts = [
        "I don't think this approach will work. It's not good enough for our needs. We can't implement it without proper planning. The team needs to understand the requirements better before we proceed.",
        "You're right about the issue. We should fix it as soon as possible. It's important to get this done quickly. Let me know if you need any help with the implementation.",
        "The project is going well. We've made good progress this week. The team is working hard and we're on track to meet our deadlines. I think we can finish everything on time."
    ]
    
    return jsonify({
        'sample_text': random.choice(sample_texts)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': 'simplified',
        'features': ['contractions', 'transitions', 'synonyms', 'passive_voice']
    })

if __name__ == '__main__':
    print("🚀 Starting AI Text Humanizer (Simplified Version)...")
    print("📝 Core text transformation features enabled")
    print("🌐 Frontend will be available at: http://localhost:5000")
    print("🔧 API endpoints available at: http://localhost:5000/api/")
    
    # Get port from environment variable (for deployment)
    port = int(os.environ.get('PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False
    )
