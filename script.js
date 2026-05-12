// ---------- 定义热门话题数组（文本 + 搜索关键词）----------
const hotTopics = [
    { text: "2026房价何时止跌？专家称Q3核心城市企稳", keyword: "2026房价止跌 核心城市企稳" },
    { text: "“分区施策”落地，一线城市限购进一步松绑", keyword: "分区施策 一线城市限购" },
    { text: "“好房子”新标: 得房率≥85% + 智慧社区受追捧", keyword: "好房子标准 得房率 智慧社区" },
    { text: "4月居民中长期贷款同比回暖，政策效果渐显", keyword: "居民中长期贷款 回暖 房贷政策" },
    { text: "提前还贷潮降温？利率下行预期改变行为", keyword: "提前还贷 利率下行" }
];

// 渲染热门话题列表（点击跳转百度搜索）
function renderHotTopics() {
    const container = document.getElementById('topicList');
    if (!container) return;
    container.innerHTML = '';
    hotTopics.forEach(topic => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-search"></i> ${topic.text}`;
        // 点击跳转百度搜索（新标签页）
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(topic.keyword)}`;
            window.open(searchUrl, '_blank');
        });
        container.appendChild(li);
    });
}

// 原有的房贷计算、城市渲染等函数保持不变（以下为完整合并版本）
// 注意：需要确保原有的所有函数都存在，这里我会给出完整的 script.js 代码（包含之前所有功能 + 话题跳转）

// ========== 以下为完整 script.js ==========
let cityChart = null;
let repayChart = null;

const cityData = [
    { name: '北京', trend: +0.2, price: 62500 },
    { name: '上海', trend: +0.3, price: 63800 },
    { name: '广州', trend: -0.1, price: 37200 },
    { name: '深圳', trend: +0.5, price: 68300 },
    { name: '杭州', trend: -0.2, price: 34800 },
    { name: '成都', trend: +0.1, price: 17800 }
];

function renderCityGrid() {
    const container = document.getElementById('cityGrid');
    if (!container) return;
    container.innerHTML = cityData.map(city => `
        <div class="city-chip" data-city="${city.name}">
            ${city.name} 
            <span class="${city.trend >= 0 ? 'trend-up' : 'trend-down'}">
                ${city.trend >= 0 ? '▲' : '▼'} ${Math.abs(city.trend)}%
            </span>
        </div>
    `).join('');
    const firstChip = document.querySelector('.city-chip');
    if(firstChip) firstChip.classList.add('active');
    updateCityChart(cityData[0].name);
    document.querySelectorAll('.city-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.city-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const cityName = chip.getAttribute('data-city');
            updateCityChart(cityName);
        });
    });
}

function getCityTrendData(cityName) {
    const baseIndex = 100;
    let months = ['1月','2月','3月','4月','5月','6月'];
    const trends = {
        '北京': [100, 99.8, 99.6, 99.9, 100.2, 100.5],
        '上海': [100, 100.2, 100.1, 100.4, 100.7, 101.0],
        '广州': [100, 99.5, 99.2, 98.9, 98.7, 98.6],
        '深圳': [100, 100.3, 100.6, 101.0, 101.4, 101.9],
        '杭州': [100, 99.7, 99.3, 98.8, 98.5, 98.3],
        '成都': [100, 100.1, 100.0, 100.2, 100.3, 100.4]
    };
    return { labels: months, data: trends[cityName] || [100,99.8,99.6,99.4,99.2,99.0] };
}

function updateCityChart(cityName) {
    const { labels, data } = getCityTrendData(cityName);
    if (cityChart) cityChart.destroy();
    const ctx = document.getElementById('cityTrendChart').getContext('2d');
    cityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${cityName} 房价指数 (基准100)`,
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.05)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#1f5e8e',
                pointRadius: 3
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }
    });
}

function computeMortgage() {
    const totalPrice = parseFloat(document.getElementById('totalPrice').value);
    const downPercent = parseFloat(document.getElementById('downPercent').value);
    const years = parseInt(document.getElementById('loanYears').value);
    let rate = parseFloat(document.getElementById('interestRate').value);
    if (isNaN(totalPrice) || totalPrice <= 0) return;
    const loanAmount = totalPrice * (1 - downPercent / 100);
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const repayType = document.querySelector('input[name="repayType"]:checked').value;
    let monthlyPayment = 0, totalInterest = 0, totalPayment = 0;
    if (repayType === 'equal' && monthlyRate > 0) {
        const factor = Math.pow(1 + monthlyRate, months);
        monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1);
        totalPayment = monthlyPayment * months;
        totalInterest = totalPayment - loanAmount;
    } else if (repayType === 'equal' && monthlyRate === 0) {
        monthlyPayment = loanAmount / months;
        totalPayment = loanAmount;
        totalInterest = 0;
    } else if (repayType === 'principal') {
        const principalPerMonth = loanAmount / months;
        let sumInterest = 0;
        for (let i = 0; i < months; i++) {
            const remaining = loanAmount - principalPerMonth * i;
            sumInterest += remaining * monthlyRate;
        }
        totalInterest = sumInterest;
        totalPayment = loanAmount + totalInterest;
        monthlyPayment = principalPerMonth + (loanAmount * monthlyRate);
        if (monthlyRate === 0) monthlyPayment = principalPerMonth;
    }
    document.getElementById('loanAmountSpan').innerHTML = loanAmount.toFixed(2) + ' 万元';
    document.getElementById('monthlySpan').innerHTML = '¥ ' + monthlyPayment.toFixed(2);
    document.getElementById('totalInterestSpan').innerHTML = '¥ ' + totalInterest.toFixed(2);
    document.getElementById('totalPaymentSpan').innerHTML = '¥ ' + totalPayment.toFixed(2);
    if (repayChart) repayChart.destroy();
    const ctx = document.getElementById('repaymentChart').getContext('2d');
    repayChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['总利息支出', '贷款本金'],
            datasets: [{
                data: [totalInterest, loanAmount * 10000],
                backgroundColor: ['#f59e0b', '#2c6b9e'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function evaluateAfford() {
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    const expense = parseFloat(document.getElementById('monthlyExpense').value);
    if (isNaN(income)) return;
    const disposable = income - expense;
    const maxMonthly = Math.max(0, disposable * 0.5);
    document.getElementById('maxMonthly').innerHTML = '¥ ' + maxMonthly.toFixed(2);
    const advice = document.getElementById('affordAdvice');
    if (maxMonthly < 3000) advice.innerHTML = '⚠️ 按揭压力较大，建议增加首付或降低购房预算。';
    else if (maxMonthly < 8000) advice.innerHTML = '✅ 可支撑主流城市刚需月供，建议控制负债比。';
    else advice.innerHTML = '🎉 负担能力良好，可考虑改善型住房或提前还款规划。';
}

function comparePrepay() {
    let remaining = parseFloat(document.getElementById('remainingLoan').value);
    let loanRate = parseFloat(document.getElementById('loanRate').value);
    let cash = parseFloat(document.getElementById('cashAmount').value);
    let investYield = parseFloat(document.getElementById('investYield').value);
    if (isNaN(remaining)) remaining = 0;
    if (isNaN(loanRate)) loanRate = 0;
    if (isNaN(cash)) cash = 0;
    if (isNaN(investYield)) investYield = 0;
    const yearlyLoanCost = remaining * (loanRate / 100);
    const yearlyInvestIncome = cash * (investYield / 100);
    const diff = yearlyLoanCost - yearlyInvestIncome;
    const resultSpan = document.querySelector('#prepayResult span');
    if (diff > 0) {
        resultSpan.innerHTML = `建议优先提前还贷，每年节省利息 ≈ ¥${diff.toFixed(2)} 万元。`;
    } else {
        resultSpan.innerHTML = `当前理财收益 (${investYield}%) 高于房贷利率 (${loanRate}%)，保留资金更划算。`;
    }
}

function bindRateShortcuts() {
    document.querySelectorAll('.rate-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const rate = parseFloat(pill.getAttribute('data-rate'));
            if (!isNaN(rate)) {
                document.getElementById('interestRate').value = rate;
                computeMortgage();
            }
        });
    });
}

function updateMoodIndices() {
    const mood = 42 + Math.floor(Math.random() * 5) - 2;
    const finalMood = Math.min(80, Math.max(20, mood));
    document.getElementById('moodIndex').innerText = finalMood;
    document.querySelector('.progress-fill').style.width = finalMood + '%';
}

window.addEventListener('DOMContentLoaded', () => {
    renderCityGrid();
    renderHotTopics();          // 动态生成可点击话题
    computeMortgage();
    evaluateAfford();
    comparePrepay();
    bindRateShortcuts();
    document.getElementById('calcLoanBtn').addEventListener('click', computeMortgage);
    document.getElementById('affordBtn').addEventListener('click', evaluateAfford);
    document.getElementById('compareBtn').addEventListener('click', comparePrepay);
    document.getElementById('monthlyIncome').addEventListener('input', evaluateAfford);
    document.getElementById('monthlyExpense').addEventListener('input', evaluateAfford);
    document.getElementById('remainingLoan').addEventListener('input', comparePrepay);
    document.getElementById('loanRate').addEventListener('input', comparePrepay);
    document.getElementById('cashAmount').addEventListener('input', comparePrepay);
    document.getElementById('investYield').addEventListener('input', comparePrepay);
    const inputs = ['totalPrice', 'downPercent', 'loanYears', 'interestRate'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', computeMortgage);
    });
    document.querySelectorAll('input[name="repayType"]').forEach(radio => radio.addEventListener('change', computeMortgage));
    updateMoodIndices();
    setInterval(updateMoodIndices, 8000);
});