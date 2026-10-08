/**
 * Insights View Controller - Renders AI Insights cards and Natural Language Chat Assistant
 */
const InsightsView = {
    renderInsights(insights) {
        const list = document.getElementById('aiInsightsList');
        if (!list) return;

        if (!insights || insights.length === 0) {
            list.innerHTML = `<div class="text-slate-400 text-xs py-6">No insights available.</div>`;
            return;
        }

        const levelMap = {
            success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
            info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
            warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            primary: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
        };

        list.innerHTML = insights.map(i => {
            const styleClass = levelMap[i.level] || levelMap.info;
            return `
                <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-start space-x-4 hover:border-slate-700 transition">
                    <div class="w-10 h-10 rounded-xl ${styleClass} border flex items-center justify-center shrink-0">
                        <i data-lucide="${i.icon || 'sparkles'}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h4 class="font-heading font-bold text-sm text-white">${i.title}</h4>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">${i.text}</p>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    },

    appendChatMessage(sender, text, metricHighlight = null) {
        const container = document.getElementById('aiChatMessages');
        if (!container) return;

        const isUser = sender === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex items-start space-x-2.5 ${isUser ? 'justify-end' : ''}`;

        msgDiv.innerHTML = isUser ? `
            <div class="bg-indigo-600 text-white rounded-2xl p-3 max-w-[85%] text-xs shadow-md">
                <p>${text}</p>
            </div>
            <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 text-[10px] font-bold">
                You
            </div>
        ` : `
            <div class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            </div>
            <div class="bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-2xl p-3.5 max-w-[85%] text-xs space-y-2">
                <p>${text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')}</p>
                ${metricHighlight ? `
                    <div class="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                        ${metricHighlight}
                    </div>
                ` : ''}
            </div>
        `;

        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;

        if (window.lucide) lucide.createIcons();
    }
};
