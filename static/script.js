/* ==================================================================
   CredWise AI – Front‑End Script (Enhanced v2)
   ==================================================================
   • Quick presets (Prime / Moderate / High Risk)
   • Form → JSON → /api/predict
   • Animated result panel (status, circular gauge, bar, cards)
   • Financial health metrics derived from inputs
   • Heuristic AI insights
   • localStorage prediction history
   • Confetti celebration on approval
   • PDF export (window.print)
   ================================================================== */

(() => {
    'use strict';

    // -------------------- Helpers --------------------
    const qs  = s => document.querySelector(s);
    const qsa = s => document.querySelectorAll(s);

    // -------------------- Loading --------------------
    const overlay = qs('#loadingOverlay');
    const setLoading = on => overlay.classList.toggle('active', on);

    // -------------------- Presets --------------------
    const presets = {
        prime: {
            Age: 30, Gender: 'Male', Marital_Status: 'Married', Dependents: 0,
            Education_Level: 'Graduate', Property_Area: 'Urban',
            Employment_Status: 'Salaried', Employer_Category: 'Private',
            Applicant_Income: 15000, Coapplicant_Income: 5000,
            Credit_Score: 750, Existing_Loans: 0, DTI_Ratio: 0.15,
            Savings: 20000, Collateral_Value: 45000,
            Loan_Amount: 12000, Loan_Term: 36, Loan_Purpose: 'Home'
        },
        moderate: {
            Age: 45, Gender: 'Female', Marital_Status: 'Married', Dependents: 2,
            Education_Level: 'Not Graduate', Property_Area: 'Semiurban',
            Employment_Status: 'Self-employed', Employer_Category: 'Government',
            Applicant_Income: 6000, Coapplicant_Income: 2000,
            Credit_Score: 620, Existing_Loans: 2, DTI_Ratio: 0.4,
            Savings: 5000, Collateral_Value: 15000,
            Loan_Amount: 20000, Loan_Term: 60, Loan_Purpose: 'Car'
        },
        high: {
            Age: 55, Gender: 'Male', Marital_Status: 'Single', Dependents: 4,
            Education_Level: 'Not Graduate', Property_Area: 'Rural',
            Employment_Status: 'Unemployed', Employer_Category: 'Unemployed',
            Applicant_Income: 2000, Coapplicant_Income: 0,
            Credit_Score: 520, Existing_Loans: 5, DTI_Ratio: 0.6,
            Savings: 500, Collateral_Value: 2000,
            Loan_Amount: 30000, Loan_Term: 84, Loan_Purpose: 'Personal'
        }
    };

    qsa('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = presets[btn.dataset.preset];
            if (!p) return;
            Object.entries(p).forEach(([k, v]) => {
                const el = qs(`[name="${k}"]`);
                if (el) el.value = v;
            });
            // Brief flash effect on the button
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => (btn.style.transform = ''), 150);
        });
    });

    // -------------------- Collect form --------------------
    const collect = () => {
        const d = {};
        qsa('.field').forEach(el => {
            let v = el.value;
            if (el.dataset.type === 'number') v = v === '' ? null : Number(v);
            d[el.name] = v;
        });
        return d;
    };

    // -------------------- Reset --------------------
    qs('#resetBtn').addEventListener('click', e => {
        e.preventDefault();
        qsa('.field').forEach(f => (f.value = ''));
        qs('#resultCard').style.display = 'none';
    });

    // -------------------- Circular Gauge --------------------
    const drawGauge = (pct, color) => {
        const canvas = qs('#circularCanvas');
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2, r = cx - 10;
        ctx.clearRect(0, 0, W, H);

        // Track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Arc
        const start = -0.5 * Math.PI;
        const end   = start + (pct / 100) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    // -------------------- Financial Card --------------------
    const makeCard = (icon, label, value, color = '#22D3EE') => {
        const d = document.createElement('div');
        d.className = 'financial-card';
        d.innerHTML = `
            <div class="icon" style="color:${color}">${icon}</div>
            <div class="value" style="color:${color}">${value}</div>
            <div class="fc-label">${label}</div>`;
        return d;
    };

    // -------------------- Insights --------------------
    const buildInsights = (data, pred, prob) => {
        const ins = [];
        const income = (data.Applicant_Income || 0) + (data.Coapplicant_Income || 0);

        // Strengths
        if (data.Credit_Score >= 700)        ins.push('✅ Excellent credit score — strong approval signal.');
        else if (data.Credit_Score >= 600)   ins.push('🟡 Fair credit score — may need additional documentation.');
        if (income >= 10000)                 ins.push('✅ Strong combined income supports repayment capacity.');
        if (data.DTI_Ratio !== null && data.DTI_Ratio <= 0.3)
            ins.push('✅ Low debt-to-income ratio indicates manageable debt load.');
        if (data.Existing_Loans !== null && data.Existing_Loans === 0)
            ins.push('✅ No existing loans — clean debt profile.');

        // Risks
        if (data.Credit_Score && data.Credit_Score < 580)
            ins.push('⚠️ Low credit score increases rejection probability.');
        if (data.DTI_Ratio !== null && data.DTI_Ratio > 0.45)
            ins.push('⚠️ High DTI ratio — lender may consider you over-leveraged.');
        if (data.Existing_Loans !== null && data.Existing_Loans >= 3)
            ins.push('⚠️ Multiple existing loans raise repayment risk.');
        if (data.Employment_Status === 'Unemployed')
            ins.push('⚠️ Unemployment status is a significant risk factor.');
        if (data.Loan_Amount && income && data.Loan_Amount / income > 5)
            ins.push('⚠️ Loan amount is very high relative to income.');

        // Suggestions (only on rejection)
        if (pred === 'No') {
            ins.push('💡 Consider reducing the requested loan amount.');
            if (data.Credit_Score && data.Credit_Score < 650)
                ins.push('💡 Improving your credit score will significantly boost approval odds.');
            if (!data.Coapplicant_Income || data.Coapplicant_Income === 0)
                ins.push('💡 Adding a co-applicant with income can strengthen the application.');
            ins.push('💡 Increasing savings or collateral demonstrates financial stability.');
        }
        return ins;
    };

    // -------------------- Confetti --------------------
    const fireConfetti = () => {
        const canvas = qs('#confetti');
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        const colors = ['#22C55E','#22D3EE','#8B5CF6','#EC4899','#F59E0B','#FFFFFF'];
        const pieces = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 4 + 2,
            c: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 4 + 2,
            rot: Math.random() * 360,
            rv: (Math.random() - 0.5) * 10
        }));
        let frame = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.rv;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.fillStyle = p.c;
                ctx.globalAlpha = Math.max(0, 1 - frame / 120);
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            frame++;
            if (frame < 120) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        requestAnimationFrame(draw);
    };

    // -------------------- History --------------------
    const KEY = 'credwise_history';
    const getHist  = () => JSON.parse(localStorage.getItem(KEY) || '[]');
    const saveHist = e => {
        const h = getHist();
        h.unshift(e);
        if (h.length > 25) h.pop();
        localStorage.setItem(KEY, JSON.stringify(h));
    };
    const renderHist = () => {
        const list = qs('#historyList');
        const h = getHist();
        if (!h.length) {
            list.innerHTML = '<div class="history-item" style="color:var(--text-muted);">No predictions yet.</div>';
            return;
        }
        list.innerHTML = h.map(i => {
            const cls = i.prediction === 'Yes' ? 'approved' : 'rejected';
            const lbl = i.prediction === 'Yes' ? 'APPROVED' : 'REJECTED';
            const dt  = new Date(i.time).toLocaleString();
            const pct = i.probability !== null ? `${(i.probability * 100).toFixed(1)}%` : '–';
            return `<div class="history-item">
                <span>${dt}</span>
                <span style="color:var(--text-grey)">${pct}</span>
                <span class="hi-status ${cls}">${lbl}</span>
            </div>`;
        }).join('');
    };

    // -------------------- PDF --------------------
    qs('#exportPdfBtn').addEventListener('click', () => window.print());

    // -------------------- PREDICT --------------------
    qs('#predictBtn').addEventListener('click', async () => {
        const payload = collect();

        // Basic validation
        const req = ['Age','Gender','Marital_Status','Education_Level',
                     'Employment_Status','Applicant_Income','Loan_Amount','Loan_Term'];
        for (const k of req) {
            if (payload[k] === null || payload[k] === '' || payload[k] === undefined) {
                alert(`Please fill the required field: ${k.replace(/_/g, ' ')}`);
                const el = qs(`[name="${k}"]`);
                if (el) { el.focus(); el.style.borderColor = '#EF4444'; setTimeout(() => (el.style.borderColor = ''), 2000); }
                return;
            }
        }

        setLoading(true);

        // Simulate a brief "analysis" delay so the spinner is visible
        await new Promise(r => setTimeout(r, 800));

        try {
            const resp = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await resp.json();
            if (!resp.ok) throw new Error(result.error || 'Server error');

            const prediction  = result.prediction[0];
            const probability = result.probability ? result.probability[0] : null;
            const approved    = prediction === 'Yes';
            const pct         = probability !== null ? probability * 100 : (approved ? 85 : 25);

            // ---- Status ----
            const statusEl = qs('#resultStatus');
            statusEl.innerHTML = approved
                ? '<i class="fas fa-check-circle"></i> APPROVED'
                : '<i class="fas fa-times-circle"></i> REJECTED';
            statusEl.className = `result-status ${approved ? 'approved' : 'rejected'}`;

            // ---- Circular gauge ----
            const gaugeColor = approved ? '#22C55E' : '#EF4444';
            // Animate from 0 to target
            let cur = 0;
            const step = () => {
                cur += 2;
                if (cur > pct) cur = pct;
                drawGauge(cur, gaugeColor);
                qs('#circularLabel').innerHTML = `<span>${Math.round(cur)}%</span><small>confidence</small>`;
                if (cur < pct) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);

            // ---- Prob bar ----
            const fill = qs('#probFill');
            fill.className = 'fill ' + (approved ? 'green' : pct > 40 ? 'amber' : 'red');
            fill.style.width = '0%';
            requestAnimationFrame(() => { fill.style.width = `${pct}%`; });
            qs('#probPercent').textContent = `${pct.toFixed(1)}%`;

            // ---- Financial cards ----
            const grid = qs('#financialGrid');
            grid.innerHTML = '';
            const totalIncome = (payload.Applicant_Income || 0) + (payload.Coapplicant_Income || 0);

            if (totalIncome)
                grid.appendChild(makeCard('<i class="fas fa-wallet"></i>', 'Total Income', `$${totalIncome.toLocaleString()}`, '#22D3EE'));
            if (payload.Credit_Score)
                grid.appendChild(makeCard('<i class="fas fa-shield-alt"></i>', 'Credit Score',
                    payload.Credit_Score, payload.Credit_Score >= 700 ? '#22C55E' : payload.Credit_Score >= 580 ? '#F59E0B' : '#EF4444'));
            if (payload.DTI_Ratio !== null && payload.DTI_Ratio !== '')
                grid.appendChild(makeCard('<i class="fas fa-balance-scale"></i>', 'DTI Ratio',
                    (payload.DTI_Ratio * 100).toFixed(0) + '%', payload.DTI_Ratio <= 0.35 ? '#22C55E' : '#F59E0B'));
            if (payload.Loan_Amount && totalIncome) {
                const lti = (payload.Loan_Amount / totalIncome).toFixed(2);
                grid.appendChild(makeCard('<i class="fas fa-chart-pie"></i>', 'Loan/Income', lti + 'x',
                    lti <= 3 ? '#22C55E' : '#F59E0B'));
            }
            if (payload.Collateral_Value && payload.Loan_Amount) {
                const cov = (payload.Collateral_Value / payload.Loan_Amount).toFixed(2);
                grid.appendChild(makeCard('<i class="fas fa-gem"></i>', 'Collateral Cov.', cov + 'x',
                    cov >= 1 ? '#22C55E' : '#EF4444'));
            }
            if (payload.Existing_Loans !== null && payload.Existing_Loans !== '')
                grid.appendChild(makeCard('<i class="fas fa-file-invoice-dollar"></i>', 'Existing Loans',
                    payload.Existing_Loans, payload.Existing_Loans <= 1 ? '#22C55E' : '#F59E0B'));

            // ---- Insights ----
            const insights = buildInsights(payload, prediction, probability);
            const insBox = qs('#insightsBox');
            const insList = qs('#insightsList');
            insList.innerHTML = insights.map(t => `<li>${t}</li>`).join('');
            insBox.style.display = insights.length ? 'block' : 'none';

            // Show result card
            const rc = qs('#resultCard');
            rc.style.display = '';
            rc.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Confetti on approval 🎉
            if (approved) fireConfetti();

            // Save to history
            saveHist({ time: Date.now(), prediction, probability });
            renderHist();

        } catch (err) {
            alert(`Prediction failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    });

    // -------------------- Init --------------------
    renderHist();
})();
