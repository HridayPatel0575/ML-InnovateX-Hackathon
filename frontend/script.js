/**
 * Nexus Anomaly Engine - Core Logic
 * Version: 2.1.0
 */

const CONFIG = {
    API_ENDPOINT: 'http://127.0.0.1:8000/predict',
    VECTOR_DIMENSION: 28,
    ANIMATION_DELAY: 400
};

document.addEventListener('DOMContentLoaded', () => {
    const matrixContainer = document.getElementById('pca-matrix-container');
    const mockDataTrigger = document.getElementById('inject-mock-data');
    const analysisEngine = document.getElementById('tx-analysis-engine');
    const evalLayer = document.getElementById('evaluation-layer');
    const closeReportBtn = document.getElementById('close-report-btn');
    const runEvalBtn = document.getElementById('run-eval-btn');

    /**
     * Initialization: System Boot & Matrix Generation
     */
    const bootMatrix = () => {
        const matrixFragment = document.createDocumentFragment();
        
        Array.from({ length: CONFIG.VECTOR_DIMENSION }).forEach((_, index) => {
            const vIndex = index + 1;
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'data-node';
            nodeDiv.innerHTML = `
                <label for="v_comp_${vIndex}">V${vIndex}</label>
                <input type="number" step="any" id="v_comp_${vIndex}" name="V${vIndex}" required placeholder="0.0000" class="numeric-input">
            `;
            matrixFragment.appendChild(nodeDiv);
        });
        
        matrixContainer.appendChild(matrixFragment);
    };

    /**
     * Data Injection: Generate Synthetic Test Vector
     */
    const injectSyntheticVector = () => {
        // Primary Indicators
        document.getElementById('prm_scaled_amt').value = (Math.random() * 500).toFixed(4);
        document.getElementById('prm_scaled_time').value = Math.random().toFixed(4);

        // PCA Matrix
        for (let i = 1; i <= CONFIG.VECTOR_DIMENSION; i++) {
            const node = document.getElementById(`v_comp_${i}`);
            // Generate varied Gaussian-like distribution noise
            node.value = (Math.random() * 4 - 2).toFixed(6);
        }
    };

    /**
     * Inference Logic: Execute API Request
     */
    const executeInference = async (event) => {
        event.preventDefault();
        
        const btnLabel = runEvalBtn.querySelector('.btn-label');
        const spinner = runEvalBtn.querySelector('.spinner-ring');

        // UI Lock & Feedback
        runEvalBtn.disabled = true;
        btnLabel.textContent = "SYNCHRONIZING VECTOR...";
        spinner.classList.remove('d-none');

        const formData = new FormData(analysisEngine);
        const vectorPayload = {};
        formData.forEach((val, key) => {
            vectorPayload[key] = parseFloat(val);
        });

        try {
            console.log("[System] Transmitting payload:", vectorPayload);
            
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vectorPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Protocol Mismatch');
            }

            const result = await response.json();
            
            // Artificial delay for "computation heavy" feel
            setTimeout(() => {
                displayEvaluationReport(result.prediction);
            }, CONFIG.ANIMATION_DELAY);

        } catch (err) {
            console.error("[Fatal] Inference Interrupted:", err);
            alert(`Nexus System Error: ${err.message}\nEnsure backend server is active at ${CONFIG.API_ENDPOINT}`);
        } finally {
            runEvalBtn.disabled = false;
            btnLabel.textContent = "INITIATE ANALYSIS";
            spinner.classList.add('d-none');
        }
    };

    /**
     * Report UI: Render Terminal Style Result
     */
    const displayEvaluationReport = (inferenceResult) => {
        const headline = document.getElementById('report-headline');
        const icon = document.getElementById('report-icon');
        const details = document.getElementById('report-details');

        if (inferenceResult === 'Fraudulent' || inferenceResult.toLowerCase().includes('fraud')) {
            headline.textContent = "ANOMALY DETECTED";
            headline.className = "result-fraud";
            icon.innerHTML = "⚠️";
            details.innerHTML = `> ALARM: HIGH PROBABILITY FRAUD<br>> NEURAL CONFIDENCE: CRITICAL<br>> PATTERN: SUSPICIOUS SEQUENCE DETECTED<br>> RECOMMENDATION: IMMEDIATE FREEZE`;
        } else {
            headline.textContent = "VALIDATED";
            headline.className = "result-safe";
            icon.innerHTML = "✅";
            details.innerHTML = `> STATUS: LEGITIMATE TRANSFER<br>> BEHAVIOR: ALIGNS WITH KNOWN PATTERNS<br>> INTEGRITY: VERIFIED<br>> ACTION: PROCEED WITH CLEARANCE`;
        }

        evalLayer.classList.remove('d-none');
    };

    // Event Bindings
    bootMatrix();
    mockDataTrigger.addEventListener('click', injectSyntheticVector);
    analysisEngine.addEventListener('submit', executeInference);
    closeReportBtn.addEventListener('click', () => evalLayer.classList.add('d-none'));
});
