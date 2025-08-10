// Enhanced Scientific Calculator with Meme Integration
document.addEventListener('DOMContentLoaded', () => {
    // State management
    let memory = 0;
    let angleMode = 'DEG'; // DEG or RAD
    let lastResult = 0;
    let expression = '';
    let history = [];
    
    // DOM elements
    const displayEl = document.getElementById('display');
    const historyEl = document.getElementById('displayHistory');
    const memeOutput = document.getElementById('memeOutput');
    const keypads = document.getElementById('keypads');
    const keypadClassic = document.getElementById('keypadClassic');
    const keypadScientific = document.getElementById('keypadScientific');
    const shareSection = document.getElementById('shareSection');
    const modeTitle = document.getElementById('modeTitle');
    const errorOverlay = document.getElementById('errorOverlay');
    const errorMessage = document.getElementById('errorMessage');

    // Meme templates
    const memeTemplates = {
        0: 'templates/0.jpg',
        1: 'templates/1.png',
        2: 'templates/2.jpg',
        3: 'templates/3.png',
        4: 'templates/4.jpg',
        5: 'templates/5.jpg',
        6: 'templates/6.jpg',
        7: 'templates/7.jpg',
        8: 'templates/8.jpg',
        9: 'templates/9.jpg',
        error: 'templates/error.jpg'
    };

    // Utility functions
    const setDisplay = (text) => {
        displayEl.textContent = text;
        displayEl.classList.toggle('error', text === 'Error');
    };

    const getDisplay = () => displayEl.textContent;

    const appendToDisplay = (value) => {
        const current = getDisplay();
        if (current === '0' || current === 'Error') {
            setDisplay(value);
        } else {
            setDisplay(current + value);
        }
    };

    const clearAll = () => {
        setDisplay('0');
        expression = '';
        historyEl.textContent = '';
        memeOutput.innerHTML = '';
        memeOutput.classList.remove('active');
        shareSection.style.display = 'none';
    };

    const clearEntry = () => {
        setDisplay('0');
    };

    const deleteLast = () => {
        const current = getDisplay();
        if (current === 'Error' || current.length === 1) {
            setDisplay('0');
        } else {
            setDisplay(current.slice(0, -1));
        }
    };

    const negate = () => {
        const current = getDisplay();
        if (current !== '0' && current !== 'Error') {
            if (current.startsWith('-')) {
                setDisplay(current.slice(1));
            } else {
                setDisplay('-' + current);
            }
        }
    };

    // Mathematical functions
    const factorial = (n) => {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };

    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const toDegrees = (radians) => radians * (180 / Math.PI);

    // Enhanced calculation engine
    const evaluateExpression = (expr) => {
        try {
            // Handle empty expression
            if (!expr.trim()) return 0;

            // Replace symbols and prepare expression
            let evalExpr = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                .replace(/%/g, '/100');

            // Handle scientific functions
            const functions = {
                'sin': (x) => angleMode === 'DEG' ? Math.sin(toRadians(x)) : Math.sin(x),
                'cos': (x) => angleMode === 'DEG' ? Math.cos(toRadians(x)) : Math.cos(x),
                'tan': (x) => angleMode === 'DEG' ? Math.tan(toRadians(x)) : Math.tan(x),
                'asin': (x) => angleMode === 'DEG' ? toDegrees(Math.asin(x)) : Math.asin(x),
                'acos': (x) => angleMode === 'DEG' ? toDegrees(Math.acos(x)) : Math.acos(x),
                'atan': (x) => angleMode === 'DEG' ? toDegrees(Math.atan(x)) : Math.atan(x),
                'log': (x) => Math.log10(x),
                'ln': (x) => Math.log(x),
                'sqrt': (x) => Math.sqrt(x),
                'cbrt': (x) => Math.cbrt(x),
                'abs': (x) => Math.abs(x),
                'exp': (x) => Math.exp(x),
                'fact': (x) => factorial(x),
                'inv': (x) => 1 / x
            };

            // Replace function calls
            Object.keys(functions).forEach(fn => {
                const regex = new RegExp(`${fn}\\(([^)]+)\\)`, 'g');
                evalExpr = evalExpr.replace(regex, `(${functions[fn].toString()})($1)`);
            });

            // Handle power functions
            evalExpr = evalExpr.replace(/(\d+(?:\.\d+)?)\*\*(\d+(?:\.\d+)?)/g, 'Math.pow($1, $2)');
            
            // Handle special cases
            evalExpr = evalExpr.replace(/(\d+)\*\*2/g, 'Math.pow($1, 2)');
            evalExpr = evalExpr.replace(/(\d+)\*\*3/g, 'Math.pow($1, 3)');

            // Validate expression
            if (!/^[\d+\-*/().\sPIEMathsinocstalgrvbf]*$/.test(evalExpr)) {
                throw new Error('Invalid characters');
            }

            // Safe evaluation
            const result = new Function(`return ${evalExpr}`)();
            
            if (!Number.isFinite(result)) {
                throw new Error('Invalid result');
            }

            return parseFloat(result.toPrecision(12));
        } catch (error) {
            console.error('Calculation Error:', error);
            return 'Error';
        }
    };

    // Calculate and display result
    const calculate = () => {
        const currentExpr = getDisplay();
        if (currentExpr === 'Error' || !currentExpr.trim()) return;

        const result = evaluateExpression(currentExpr);
        
        if (result === 'Error') {
            showError('Calculation Error - Please check your expression');
            renderErrorMeme();
        } else {
            lastResult = result;
            expression = currentExpr;
            historyEl.textContent = `${currentExpr} = ${result}`;
            setDisplay(String(result));
            renderMemeOutput(String(result));
        }
        
        shareSection.style.display = 'flex';
    };

    // Meme rendering functions
    const renderMemeOutput = (resultStr) => {
        memeOutput.innerHTML = '';
        memeOutput.classList.add('active');

        if (resultStr === 'Error') {
            renderErrorMeme();
            return;
        }

        let displayStr = resultStr;
        
        // Handle negative numbers
        if (displayStr.startsWith('-')) {
            const negSign = document.createElement('div');
            negSign.textContent = '−';
            negSign.style.fontSize = '48px';
            negSign.style.color = '#dc3545';
            negSign.style.fontWeight = 'bold';
            negSign.style.marginRight = '10px';
            memeOutput.appendChild(negSign);
            displayStr = displayStr.slice(1);
        }

        // Handle decimal point
        for (const char of displayStr) {
            const container = document.createElement('div');
            container.style.display = 'inline-block';
            container.style.margin = '5px';

            if (char >= '0' && char <= '9') {
                const img = document.createElement('img');
                img.className = 'meme-digit';
                img.src = memeTemplates[char];
                img.alt = `Meme for ${char}`;
                img.onerror = () => {
                    container.innerHTML = `<div style="font-size: 2em; font-weight: bold; padding: 10px; background: #f0f0f0; border-radius: 8px;">${char}</div>`;
                };
                container.appendChild(img);
            } else if (char === '.') {
                container.textContent = '.';
                container.style.fontSize = '48px';
                container.style.fontWeight = 'bold';
                container.style.color = '#667eea';
                container.style.margin = '0 5px';
            }
            memeOutput.appendChild(container);
        }
    };

    const renderErrorMeme = () => {
        memeOutput.innerHTML = '';
        memeOutput.classList.add('active');
        
        const img = document.createElement('img');
        img.className = 'meme-error';
        img.src = memeTemplates.error;
        img.alt = 'Calculation Error';
        memeOutput.appendChild(img);
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorOverlay.style.display = 'flex';
    };

    // Memory functions
    const handleMemory = (operation) => {
        const currentValue = parseFloat(getDisplay());
        
        switch (operation) {
            case 'MC':
                memory = 0;
                break;
            case 'MR':
                setDisplay(String(memory));
                break;
            case 'M+':
                if (!isNaN(currentValue) && currentValue !== 'Error') {
                    memory += currentValue;
                }
                break;
            case 'M-':
                if (!isNaN(currentValue) && currentValue !== 'Error') {
                    memory -= currentValue;
                }
                break;
        }
    };

    // Scientific function handlers
    const handleScientificFunction = (func) => {
        const current = getDisplay();
        if (current === 'Error') return;

        let newExpr = '';
        switch (func) {
            case 'square':
                newExpr = `(${current})^2`;
                break;
            case 'cube':
                newExpr = `(${current})^3`;
                break;
            case 'pow':
                newExpr = `(${current})^`;
                break;
            case 'inv':
                newExpr = `1/(${current})`;
                break;
            case 'sqrt':
                newExpr = `sqrt(${current})`;
                break;
            case 'cbrt':
                newExpr = `cbrt(${current})`;
                break;
            case 'fact':
                newExpr = `fact(${current})`;
                break;
            case 'abs':
                newExpr = `abs(${current})`;
                break;
            case 'exp':
                newExpr = `exp(${current})`;
                break;
            default:
                newExpr = `${func}(${current})`;
        }
        
        setDisplay(newExpr);
    };

    // Event listeners
    const handleButtonClick = (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const { action, value, fn, constant, mem } = button.dataset;

        // Handle different button types
        if (value) {
            appendToDisplay(value);
        } else if (action) {
            switch (action) {
                case 'clear-all':
                    clearAll();
                    break;
                case 'clear':
                    clearEntry();
                    break;
                case 'del':
                    deleteLast();
                    break;
                case 'equals':
                    calculate();
                    break;
                case 'negate':
                    negate();
                    break;
            }
        } else if (fn) {
            handleScientificFunction(fn);
        } else if (constant) {
            appendToDisplay(constant);
        } else if (mem) {
            handleMemory(mem);
        }
    };

    // Mode switching
    const handleModeSwitch = (e) => {
        const button = e.target.closest('.mode-btn');
        if (!button) return;

        document.querySelector('.mode-btn.active').classList.remove('active');
        button.classList.add('active');
        
        const mode = button.dataset.mode;
        keypadClassic.classList.toggle('hidden', mode !== 'classic');
        keypadScientific.classList.toggle('hidden', mode !== 'scientific');
        
        modeTitle.textContent = mode === 'classic' ? 'Standard Calculator' : 'Scientific Calculator';
    };

    // Angle mode switching
    const handleAngleMode = (e) => {
        angleMode = e.target.value;
    };

    // Keyboard support
    const handleKeyboard = (e) => {
        e.preventDefault();
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            appendToDisplay(key);
        } else if (key === '.') {
            appendToDisplay('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            appendToDisplay(key === '*' ? '*' : key);
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            clearAll();
        } else if (key === 'Backspace') {
            deleteLast();
        } else if (key === '(' || key === ')') {
            appendToDisplay(key);
        } else if (key === '%') {
            appendToDisplay('%');
        }
    };

    // Share functionality
    const handleShare = () => {
        const result = getDisplay();
        if (result === 'Error' || result === '0') {
            showError('No valid result to share');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'My Calculation Result',
                text: `I calculated: ${expression} = ${result}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback for browsers without share API
            const text = `Calculation: ${expression} = ${result}`;
            navigator.clipboard.writeText(text).then(() => {
                showError('Result copied to clipboard!');
                setTimeout(() => errorOverlay.style.display = 'none', 2000);
            });
        }
    };

    const handleDownload = () => {
        // This would require html2canvas or similar library
        showError('Download functionality requires additional setup');
    };

    // Initialize event listeners
    keypads.addEventListener('click', handleButtonClick);
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', handleModeSwitch);
    });
    document.querySelectorAll('input[name="angle"]').forEach(radio => {
        radio.addEventListener('change', handleAngleMode);
    });
    document.getElementById('btnShare').addEventListener('click', handleShare);
    document.getElementById('btnDownload').addEventListener('click', handleDownload);
    document.addEventListener('keydown', handleKeyboard);

    // Global error close function
    window.closeError = () => {
        errorOverlay.style.display = 'none';
    };

    // Initialize
    clearAll();
});
