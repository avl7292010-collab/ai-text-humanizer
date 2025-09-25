// AI Text Humanizer Pro - Frontend with Python Backend Integration

class TextHumanizerFrontend {
    constructor() {
        this.apiBaseUrl = '/api';
        this.isBackendAvailable = false;
        this.checkBackendHealth();
    }

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            this.isBackendAvailable = data.status === 'healthy';
            
            if (this.isBackendAvailable) {
                console.log('✅ Python backend is available with full libraries');
                this.showBackendStatus('Python Backend Active', 'success');
            } else {
                console.log('⚠️ Python backend not available, using fallback');
                this.showBackendStatus('Using Fallback Mode', 'warning');
            }
        } catch (error) {
            console.log('⚠️ Python backend not available, using fallback');
            this.isBackendAvailable = false;
            this.showBackendStatus('Using Fallback Mode', 'warning');
        }
    }

    showBackendStatus(message, type) {
        const statusElement = document.createElement('div');
        statusElement.className = `backend-status backend-status-${type}`;
        statusElement.innerHTML = `
            <span class="status-icon">${type === 'success' ? '🐍' : '⚠️'}</span>
            <span class="status-text">${message}</span>
        `;
        
        const header = document.querySelector('.header-content');
        if (header && !document.querySelector('.backend-status')) {
            header.appendChild(statusElement);
        }
    }

    async transformText(text, options) {
        if (this.isBackendAvailable) {
            return await this.transformWithBackend(text, options);
        } else {
            return this.transformWithFallback(text, options);
        }
    }

    async transformWithBackend(text, options) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/transform`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    use_passive: options.usePassive,
                    use_synonyms: options.useSynonyms,
                    preserve_structure: options.preserveStructure,
                    intensity: options.intensity,
                    style: options.style
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                return {
                    transformedText: data.transformed_text,
                    statistics: data.statistics,
                    optionsUsed: data.options_used
                };
            } else {
                throw new Error(data.error || 'Transformation failed');
            }
        } catch (error) {
            console.error('Backend transformation failed:', error);
            // Fallback to JavaScript transformation
            return this.transformWithFallback(text, options);
        }
    }

    transformWithFallback(text, options) {
        // Fallback JavaScript transformation (same as before)
        const contractions = {
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
        };

        const transitions = [
            "Moreover,", "Additionally,", "Furthermore,", "Hence,", 
            "Therefore,", "Consequently,", "Nonetheless,", "Nevertheless,"
        ];

        const synonyms = {
            "good": "excellent", "bad": "poor", "big": "significant", "small": "minimal",
            "important": "crucial", "easy": "straightforward", "hard": "challenging",
            "help": "assist", "use": "utilize", "get": "obtain", "make": "create",
            "show": "demonstrate", "tell": "inform", "ask": "inquire", "try": "attempt",
            "start": "commence", "end": "conclude", "find": "discover", "know": "understand"
        };

        let result = text;

        // Expand contractions
        for (const [contraction, expansion] of Object.entries(contractions)) {
            const pattern = new RegExp(`\\b${this.escapeRegExp(contraction)}\\b`, 'gi');
            result = result.replace(pattern, expansion);
        }

        // Add transitions
        const sentences = result.split('. ');
        if (sentences.length > 1) {
            for (let i = 1; i < sentences.length; i++) {
                if (Math.random() < 0.3) {
                    const transition = transitions[Math.floor(Math.random() * transitions.length)];
                    sentences[i] = `${transition} ${sentences[i]}`;
                }
            }
            result = sentences.join('. ');
        }

        // Apply options
        if (options.usePassive) {
            result = this.convertToPassive(result);
        }

        if (options.useSynonyms) {
            result = this.replaceWithSynonyms(result, synonyms);
        }

        // Calculate statistics
        const statistics = {
            input_words: this.countWords(text),
            input_sentences: this.countSentences(text),
            output_words: this.countWords(result),
            output_sentences: this.countSentences(result)
        };

        return {
            transformedText: result,
            statistics: statistics,
            optionsUsed: options
        };
    }

    convertToPassive(text) {
        const sentences = text.split('. ');
        const passiveSentences = [];
        
        for (let sentence of sentences) {
            if (Math.random() < 0.2) {
                sentence = sentence.replace(/\bI do\b/gi, "It is done by me");
                sentence = sentence.replace(/\bwe can\b/gi, "it can be done by us");
                sentence = sentence.replace(/\byou should\b/gi, "it should be done by you");
                sentence = sentence.replace(/\bthey will\b/gi, "it will be done by them");
            }
            passiveSentences.push(sentence);
        }
        
        return passiveSentences.join('. ');
    }

    replaceWithSynonyms(text, synonyms) {
        let result = text;
        for (const [word, synonym] of Object.entries(synonyms)) {
            const pattern = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gi');
            if (Math.random() < 0.3) {
                result = result.replace(pattern, synonym);
            }
        }
        return result;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    countSentences(text) {
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    }

    async getSampleText() {
        if (this.isBackendAvailable) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/sample`);
                const data = await response.json();
                return data.sample_text;
            } catch (error) {
                console.error('Failed to get sample from backend:', error);
            }
        }
        
        // Fallback sample texts
        const sampleTexts = [
            "I don't think this approach will work. It's not good enough for our needs. We can't implement it without proper planning. The team needs to understand the requirements better before we proceed.",
            "You're right about the issue. We should fix it as soon as possible. It's important to get this done quickly. Let me know if you need any help with the implementation.",
            "The project is going well. We've made good progress this week. The team is working hard and we're on track to meet our deadlines. I think we can finish everything on time."
        ];
        
        return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    const humanizer = new TextHumanizerFrontend();
    
    // Get DOM elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const transformBtn = document.getElementById('transformBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputSection = document.getElementById('outputSection');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successToast = document.getElementById('successToast');
    
    // Configuration elements
    const usePassive = document.getElementById('usePassive');
    const useSynonyms = document.getElementById('useSynonyms');
    const preserveStructure = document.getElementById('preserveStructure');
    const intensity = document.getElementById('intensity');
    const style = document.getElementById('style');
    
    // Quick action buttons
    const loadSample = document.getElementById('loadSample');
    const clearAll = document.getElementById('clearAll');
    
    // Statistics elements
    const inputWords = document.getElementById('inputWords');
    const inputSentences = document.getElementById('inputSentences');
    const outputWords = document.getElementById('outputWords');
    const outputSentences = document.getElementById('outputSentences');

    // Transform button click handler
    transformBtn.addEventListener('click', async function() {
        const text = inputText.value.trim();
        
        if (!text) {
            showToast('Please enter some text to transform.', 'error');
            return;
        }

        // Show loading overlay
        showLoadingOverlay();

        try {
            // Get options
            const options = {
                usePassive: usePassive.checked,
                useSynonyms: useSynonyms.checked,
                preserveStructure: preserveStructure.checked,
                intensity: intensity.value,
                style: style.value
            };

            // Transform text
            const result = await humanizer.transformText(text, options);

            // Update output
            outputText.value = result.transformedText;

            // Update statistics
            inputWords.textContent = result.statistics.input_words;
            inputSentences.textContent = result.statistics.input_sentences;
            outputWords.textContent = result.statistics.output_words;
            outputSentences.textContent = result.statistics.output_sentences;

            // Show output section
            outputSection.style.display = 'block';
            outputSection.scrollIntoView({ behavior: 'smooth' });

            showToast('Text transformed successfully!', 'success');

        } catch (error) {
            console.error('Error transforming text:', error);
            showToast('Error transforming text. Please try again.', 'error');
        } finally {
            // Hide loading overlay
            hideLoadingOverlay();
        }
    });

    // Copy button click handler
    copyBtn.addEventListener('click', function() {
        const text = outputText.value;
        
        if (!text) {
            showToast('No text to copy.', 'error');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showToast('Text copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');
            showToast('Text copied to clipboard!', 'success');
        });
    });

    // Load sample text
    loadSample.addEventListener('click', async function() {
        const sampleText = await humanizer.getSampleText();
        inputText.value = sampleText;
        showToast('Sample text loaded!', 'success');
    });

    // Clear all
    clearAll.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        outputSection.style.display = 'none';
        
        // Reset checkboxes
        usePassive.checked = false;
        useSynonyms.checked = false;
        preserveStructure.checked = false;
        
        showToast('All cleared!', 'success');
    });

    // Show loading overlay
    function showLoadingOverlay() {
        loadingOverlay.style.display = 'flex';
    }

    // Hide loading overlay
    function hideLoadingOverlay() {
        loadingOverlay.style.display = 'none';
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = successToast;
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastMessage.textContent = message;
        
        if (type === 'success') {
            toast.className = 'toast toast-success';
            toastIcon.textContent = '✅';
        } else if (type === 'error') {
            toast.className = 'toast toast-error';
            toastIcon.textContent = '❌';
        }
        
        toast.style.display = 'flex';
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add some interactive effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add typing effect to header
    const headerTitle = document.querySelector('.header-title');
    const originalText = headerTitle.textContent;
    headerTitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            headerTitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step-card, .app-card, .config-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    console.log('AI Text Humanizer Pro Frontend initialized successfully!');
});
