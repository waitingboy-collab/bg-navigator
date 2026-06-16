const defaultSegments = [
    { id: "city", name: "Градско (излизане)", distance: 10, mySpeed: 50, allowedSpeed: 50 },
    { id: "ring", name: "Околовръстен път", distance: 15, mySpeed: 80, allowedSpeed: 60 },
    { id: "country", name: "Извънградски път", distance: 40, mySpeed: 90, allowedSpeed: 90 },
    { id: "trakia", name: "Магистрала Тракия", distance: 120, mySpeed: 140, allowedSpeed: 140 }
];

function renderInputs() {
    const container = document.getElementById("segments-container");
    container.innerHTML = "";

    defaultSegments.forEach(seg => {
        container.innerHTML += `
            <div class="segment">
                <h4>📍 ${seg.name} (Ограничение: ${seg.allowedSpeed} км/ч)</h4>
                <label>Разстояние (км):</label>
                <input type="number" id="${seg.id}-dist" value="${seg.distance}">
                <label>Твоята Скорост (км/ч):</label>
                <input type="number" id="${seg.id}-speed" value="${seg.mySpeed}">
            </div>
        `;
    });
}

function runAppCalculation() {
    let totalTime = 0; 
    let totalDistance = 0;
    let totalFuelLitres = 0;
    let totalFuelCostEUR = 0;
    let speedWarning = false;
    let logHTML = "<h4>Анализ по участъци:</h4><ul>";

    const depTimeValue = document.getElementById("departure-time").value;
    const [depHours, depMinutes] = depTimeValue.split(":").map(Number);
    const fuelConsumption = parseFloat(document.getElementById("fuel-consumption").value) || 0;
    const fuelPriceEUR = parseFloat(document.getElementById("fuel-price-eur").value) || 0;

    for (let seg of defaultSegments) {
        const dist = parseFloat(document.getElementById(`${seg.id}-dist`).value);
        const speed = parseFloat(document.getElementById(`${seg.id}-speed`).value);

        if (speed <= 0 || dist <= 0) {
            alert(`Моля въведете коректни данни за ${seg.name}`);
            return;
        }

        const segmentTime = dist / speed;
        totalTime += segmentTime;
        totalDistance += dist;

        // Изчисляване на разхода и цената в евро за участъка
        const segmentFuel = (dist * fuelConsumption) / 100;
        const segmentCostEUR = segmentFuel * fuelPriceEUR;
        
        totalFuelLitres += segmentFuel;
        totalFuelCostEUR += segmentCostEUR;

        const segmentMinutes = Math.round(segmentTime * 60);
        logHTML += `<li><strong>${seg.name}:</strong> ${segmentMinutes} мин. | Гориво: ${segmentFuel.toFixed(2)} л. (~${segmentCostEUR.toFixed(2)} €)</li>`;

        if (speed > seg.allowedSpeed) {
            speedWarning = true;
        }
    }

    logHTML += "</ul><hr>";

    // Превръщане на времетраенето
    const totalMinutesDuration = Math.round(totalTime * 60);
    const durationHours = Math.floor(totalMinutesDuration / 60);
    const durationMinutes = totalMinutesDuration % 60;

    // Изчисляване на часа на пристигане
    let arrivalMinutes = depMinutes + durationMinutes;
    let arrivalHours = depHours + durationHours + Math.floor(arrivalMinutes / 60);
    arrivalMinutes = arrivalMinutes % 60;
    arrivalHours = arrivalHours % 24;

    const formattedArrival = `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;

    // Обръщане на финалната цена и в лева за удобство
    const totalFuelCostBGN = totalFuelCostEUR * 1.95583;

    // Резюме на екрана
    logHTML += `<p><strong>Общо разстояние:</strong> ${totalDistance.toFixed(1)} км</p>`;
    logHTML += `<p><strong>Времетраене:</strong> ${durationHours} ч. и ${durationMinutes} мин.</p>`;
    logHTML += `<p style="font-size: 17px; color: #0275d8;"><strong>🕒 Час на пристигане: около ${formattedArrival} ч.</strong></p>`;
    logHTML += `<p style="font-size: 17px; color: #5cb85c;"><strong>⛽ Общо гориво: ${totalFuelLitres.toFixed(2)} литра</strong></p>`;
    logHTML += `<p style="font-size: 17px; color: #5cb85c;"><strong>💵 Обща цена: ${totalFuelCostEUR.toFixed(2)} € (${totalFuelCostBGN.toFixed(2)} лв.)</strong></p><hr>`;

    const resultsDiv = document.getElementById("results");
    resultsDiv.style.display = "block";

    if (speedWarning) {
        resultsDiv.className = "warning";
        logHTML += "<p><strong>⛔ Внимание:</strong> Превишаваш ограниченията в някои участъци!</p>";
    } else {
        resultsDiv.className = "success";
        logHTML += "<p><strong>✅ Лек път:</strong> Всички скорости са в нормите.</p>";
    }

    resultsDiv.innerHTML = logHTML;
}

renderInputs();