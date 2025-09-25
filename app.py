#!/usr/bin/env python3
"""
AI Text Humanizer Pro - Flask Backend with Full Python Libraries
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sys
import os

# Add the transformer module to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from transformer.app import AcademicTextHumanizer, NLP_GLOBAL, download_nltk_resources
from nltk.tokenize import word_tokenize
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Download NLTK resources on startup
try:
    download_nltk_resources()
    print("✅ NLTK resources downloaded successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not download NLTK resources: {e}")

# Initialize the humanizer
try:
    humanizer = AcademicTextHumanizer(
        p_passive=0.3,
        p_synonym_replacement=0.3,
        p_academic_transition=0.4
    )
    print("✅ AcademicTextHumanizer initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not initialize humanizer: {e}")
    humanizer = None

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
        preserve_structure = data.get('preserve_structure', False)
        intensity = data.get('intensity', 'medium')
        style = data.get('style', 'academic')
        
        # Transform text using the full Python humanizer
        if humanizer:
            transformed = humanizer.humanize_text(
                text,
                use_passive=use_passive,
                use_synonyms=use_synonyms,
                preserve_structure=preserve_structure
            )
        else:
            # Fallback to simple transformation if humanizer not available
            transformed = simple_transform(text, use_passive, use_synonyms)
        
        # Calculate statistics
        input_word_count = len(word_tokenize(text, language='english', preserve_line=True))
        doc_input = NLP_GLOBAL(text)
        input_sentence_count = len(list(doc_input.sents))
        
        output_word_count = len(word_tokenize(transformed, language='english', preserve_line=True))
        doc_output = NLP_GLOBAL(transformed)
        output_sentence_count = len(list(doc_output.sents))
        
        return jsonify({
            'success': True,
            'transformed_text': transformed,
            'statistics': {
                'input_words': input_word_count,
                'input_sentences': input_sentence_count,
                'output_words': output_word_count,
                'output_sentences': output_sentence_count
            },
            'options_used': {
                'use_passive': use_passive,
                'use_synonyms': use_synonyms,
                'preserve_structure': preserve_structure,
                'intensity': intensity,
                'style': style
            }
        })
        
    except Exception as e:
        print(f"Error in transform_text: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Transformation failed: {str(e)}'
        }), 500

@app.route('/api/sample', methods=['GET'])
def get_sample_text():
    """Get sample text for testing"""
    sample_texts = [
        "I don't think this approach will work. It's not good enough for our needs. We can't implement it without proper planning. The team needs to understand the requirements better before we proceed.",
        "You're right about the issue. We should fix it as soon as possible. It's important to get this done quickly. Let me know if you need any help with the implementation.",
        "The project is going well. We've made good progress this week. The team is working hard and we're on track to meet our deadlines. I think we can finish everything on time.",
        "This is a great idea! We should definitely try it. It might help us solve the problem we've been having. Let's discuss it in the next meeting and see what everyone thinks.",
        "I'm not sure about this solution. It seems too complicated for what we need. Maybe we should look for a simpler approach. What do you think about trying something different?"
    ]
    
    import random
    return jsonify({
        'sample_text': random.choice(sample_texts)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'humanizer_available': humanizer is not None,
        'nltk_available': True,
        'spacy_available': True
    })

def simple_transform(text, use_passive=False, use_synonyms=False):
    """Simple fallback transformation if full humanizer is not available"""
    import re
    
    # Basic contraction expansion
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
    
    # Add basic transitions
    transitions = ["Moreover,", "Additionally,", "Furthermore,", "Hence,", "Therefore,", "Consequently,", "Nonetheless,", "Nevertheless,"]
    sentences = result.split('. ')
    if len(sentences) > 1:
        import random
        for i in range(1, len(sentences)):
            if random.random() < 0.3:
                transition = random.choice(transitions)
                sentences[i] = f"{transition} {sentences[i]}"
        result = '. '.join(sentences)
    
    return result

if __name__ == '__main__':
    print("🚀 Starting AI Text Humanizer Pro Flask Server...")
    print("📝 Full Python libraries enabled")
    print("🌐 Frontend will be available at: http://localhost:5000")
    print("🔧 API endpoints available at: http://localhost:5000/api/")
    
    # Get port from environment variable (for deployment)
    port = int(os.environ.get('PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,  # Set to False for production
        threaded=True
    )
