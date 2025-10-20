const addictions = ['cigarro', 'pornografia', 'telas'];
        const timers = {};

        // Helper: safely get an element
        function el(id) {
            return document.getElementById(id) || null;
        }

        // Helper: pad numbers (e.g., 5 -> "05")
        function pad(n) {
            return n < 10 ? '0' + n : String(n);
        }

        // Ensure saved date is valid; if not, set to now and persist
        function parseSavedDate(addiction) {
            const key = `${addiction}_reset_date`;
            const raw = localStorage.getItem(key);
            if (!raw) {
                const now = new Date();
                localStorage.setItem(key, now.toISOString());
                return now;
            }
            const d = new Date(raw);
            if (Number.isNaN(d.getTime())) {
                // invalid date in storage, replace with now
                const now = new Date();
                localStorage.setItem(key, now.toISOString());
                return now;
            }
            return d;
        }

        function loadDates() {
            addictions.forEach(addiction => {
                timers[addiction] = parseSavedDate(addiction);
                updateLastResetDisplay(addiction);
            });
        }

        function resetTimer(addiction) {
            if (confirm(`Tem certeza que deseja resetar o contador de ${addiction}?`)) {
                const now = new Date();
                timers[addiction] = now;
                localStorage.setItem(`${addiction}_reset_date`, now.toISOString());
                updateLastResetDisplay(addiction);
                updateTimer(addiction);
            }
        }

        function updateLastResetDisplay(addiction) {
            const lastResetElement = el(`${addiction}-last-reset`);
            if (!lastResetElement) return;
            const resetDate = parseSavedDate(addiction);
            // Defensive: ensure resetDate is valid
            if (Number.isNaN(resetDate.getTime())) {
                lastResetElement.textContent = 'Último reset: data inválida';
                return;
            }
            const formattedDate = resetDate.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            lastResetElement.textContent = `Último reset: ${formattedDate}`;
        }

        function updateTimer(addiction) {
            // Defensive checks
            if (!timers.hasOwnProperty(addiction)) {
                timers[addiction] = parseSavedDate(addiction);
            }
            const startDate = timers[addiction];
            if (!startDate || Number.isNaN(new Date(startDate).getTime())) {
                timers[addiction] = parseSavedDate(addiction);
            }

            const now = new Date();
            const diffMs = now - new Date(timers[addiction]);
            if (Number.isNaN(diffMs)) return; // can't compute

            const totalSeconds = Math.floor(diffMs / 1000);
            const seconds = totalSeconds % 60;
            const totalMinutes = Math.floor(totalSeconds / 60);
            const minutes = totalMinutes % 60;
            const totalHours = Math.floor(totalMinutes / 60);
            const hours = totalHours % 24;
            const days = Math.floor(totalHours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);

            const elSeconds = el(`${addiction}-seconds`);
            const elMinutes = el(`${addiction}-minutes`);
            const elHours = el(`${addiction}-hours`);
            const elDays = el(`${addiction}-days`);
            const elMonths = el(`${addiction}-months`);
            const elYears = el(`${addiction}-years`);

            if (elSeconds) elSeconds.textContent = pad(seconds);
            if (elMinutes) elMinutes.textContent = pad(minutes);
            if (elHours) elHours.textContent = pad(hours);
            if (elDays) elDays.textContent = String(days);
            if (elMonths) elMonths.textContent = String(months);
            if (elYears) elYears.textContent = String(years);
        }

        function updateAllTimers() {
            addictions.forEach(addiction => {
                try {
                    updateTimer(addiction);
                } catch (e) {
                    // keep running others if one fails
                    console.error('Erro atualizando timer', addiction, e);
                }
            });
        }

        // inicialização
        loadDates();
        updateAllTimers();
        setInterval(updateAllTimers, 1000);