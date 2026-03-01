const scrollToggleBtn = document.getElementById("scrollToggleBtn");
const scrollControls = document.querySelector(".scroll-controls");
let lastScrollY = window.scrollY;
let scrollMode = "down";  // "down" → go bottom, "up" → go top
const container = document.getElementById("questionsContainer");
const reportCorrect = document.getElementById("reportCorrect");
const reportIncorrect = document.getElementById("reportIncorrect");
const correctOptionsBox = document.getElementById("correctOptions");
const incorrectOptionsBox = document.getElementById("incorrectOptions");
const reportDifficulty = document.getElementById("reportDifficulty");
const resetBtn = document.getElementById("resetBtn");
const filterStatus = document.getElementById("filterStatus");
const filterDifficulty = document.getElementById("filterDifficulty");
const filterReason = document.getElementById("filterReason");
const filterCount = document.getElementById("filterCount");
const questionBoxes = [];

/* Labels */
const correctLabels = [
    "Knowledge-Based", "MAD Apply", "50:50 (Good-Luck)", "PYQ-Based"
];
const incorrectLabels = [
    "Source-Issue", "Reading-Issue", "Recall-Issue",
    "Application / Focus-Issue", "MAD Error", "50:50 (Bad-Luck)"
];

/* Data for 100 questions */
let data = Array(100).fill(null).map(() => ({
    status: null,
    option: null,
    difficulty: 0
}));

/* Chart instances */
let difficultyChart = null;
let incorrectChart = null;
let correctChart = null;

/* Build 100 question boxes */
for (let i = 1; i <= 100; i++) {
    const index = i - 1;
    const box = document.createElement("div");
    box.className = "question-box";

    box.innerHTML = `
        <h3>Question ${i}</h3>
        <div class="qStatus">
            <div>
                <button class="correct-btn">Correct</button>
                <button class="incorrect-btn">Incorrect</button>
            </div>
            <span class="statusText">Status: Not Selected</span>
        </div>

        <div class="option-container"></div>
        <div class="qStars">
            <span class="qStar" data-stars="1">☆</span>
            <span class="qStar" data-stars="2">☆</span>
            <span class="qStar" data-stars="3">☆</span>
            <span class="difficultyText">Difficulty: Not Selected</span>
        </div>
    `;

    const correctBtn = box.querySelector(".correct-btn");
    const incorrectBtn = box.querySelector(".incorrect-btn");
    const optionsArea = box.querySelector(".option-container");
    const qStars = box.querySelectorAll(".qStar");
    const diffText = box.querySelector(".difficultyText");
    const statusText = box.querySelector(".statusText");

    correctBtn.onclick = () => {
        // if clicking again → reset
        if (data[index].status === "Correct") {
            data[index].status = null;
            data[index].option = null;
            correctBtn.classList.remove("selected");
            optionsArea.innerHTML = "";
            statusText.textContent = "Status: Not Selected";
            updateReport();
            return;
        }

        // otherwise apply correct
        data[index].status = "Correct";
        data[index].option = null;
        correctBtn.classList.add("selected");
        incorrectBtn.classList.remove("selected");
        optionsArea.innerHTML = "";
        statusText.textContent = "Status: ✅ Correct";
        addOptions(correctLabels);
        updateReport();
    };

    incorrectBtn.onclick = () => {
        // if clicking again → reset
        if (data[index].status === "Incorrect") {
            data[index].status = null;
            data[index].option = null;
            incorrectBtn.classList.remove("selected");
            optionsArea.innerHTML = "";
            statusText.textContent = "Status: Not Selected"; 
            updateReport();
            return;
        }

        // otherwise apply incorrect
        data[index].status = "Incorrect";
        data[index].option = null;
        incorrectBtn.classList.add("selected");
        correctBtn.classList.remove("selected");
        optionsArea.innerHTML = "";
        statusText.textContent = "Status: ❌ Incorrect"; 
        addOptions(incorrectLabels);
        updateReport();
    };

    function addOptions(choices) {
        choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = choice;
            btn.onclick = () => {
                data[index].option = choice;
                optionsArea.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                updateReport();
            };
            optionsArea.appendChild(btn);
        });
    }

    /* difficulty stars */
    qStars.forEach(star => {
        star.onclick = () => {
            const clicked = Number(star.dataset.stars);

            // If clicked same value again → reset
            if (data[index].difficulty === clicked) {
                data[index].difficulty = 0;

                qStars.forEach(s => {
                    s.classList.remove("filled");
                    s.textContent = "☆";
                });

                diffText.textContent = "Difficulty: Not Selected";
                updateReport();
                return;
            }

            // Otherwise apply new difficulty
            data[index].difficulty = clicked;

            qStars.forEach(s => {
                s.classList.remove("filled");
                s.textContent = "☆";
            });

            for (let i = 0; i < clicked; i++) {
                qStars[i].classList.add("filled");
                qStars[i].textContent = "★";
            }

            const diffLabel =
                clicked === 1 ? "Easy" :
                clicked === 2 ? "Medium" :
                "Hard";

            diffText.textContent = `Difficulty: ${diffLabel}`;

            updateReport();
        };
    });

    container.appendChild(box);
    questionBoxes.push(box);
}

/* Update Summary */
function updateReport() {
    let c = 0, ic = 0;
    let correctMap = Object.fromEntries(correctLabels.map(l => [l, 0]));
    let incorrectMap = Object.fromEntries(incorrectLabels.map(l => [l, 0]));
    let diff = { easy: 0, medium: 0, hard: 0 };

    data.forEach(q => {
        if (q.status === "Correct") {
            c++;
            if (q.option) correctMap[q.option]++;
        }
        if (q.status === "Incorrect") {
            ic++;
            if (q.option) incorrectMap[q.option]++;
        }

        if (q.difficulty === 1) diff.easy++;
        if (q.difficulty === 2) diff.medium++;
        if (q.difficulty === 3) diff.hard++;
    });

    reportCorrect.textContent = `Correct: ${c}`;
    reportIncorrect.textContent = `Incorrect: ${ic}`;

    correctOptionsBox.innerHTML =
        `1. Knowledge-Based: ${correctMap["Knowledge-Based"]} <br>
        2. MAD Apply: ${correctMap["MAD Apply"]} <br>
        3. 50:50 (Good-Luck): ${correctMap["50:50 (Good-Luck)"]} <br>
        4. PYQ-Based: ${correctMap["PYQ-Based"]}`;

    incorrectOptionsBox.innerHTML =
        `1. Source-Issue: ${incorrectMap["Source-Issue"]} <br>
        2. Reading-Issue: ${incorrectMap["Reading-Issue"]} <br>
        3. Recall-Issue: ${incorrectMap["Recall-Issue"]} <br>
        4. Application / Focus-Issue: ${incorrectMap["Application / Focus-Issue"]} <br>
        5. MAD Error: ${incorrectMap["MAD Error"]} <br>
        6. 50:50 (Bad-Luck): ${incorrectMap["50:50 (Bad-Luck)"]}`;

    reportDifficulty.innerHTML =
        `😎Easy: ${diff.easy}👌<br>
        🤓Medium: ${diff.medium}💡<br>
        💀Hard: ${diff.hard}☠️`;

    updateCharts(diff, correctMap, incorrectMap);
    applyFilter();  // re-apply current filter to reflect new answers
}


function applyFilter() {
    const statusVal = filterStatus.value;        // all / correct / incorrect / unattempted
    const diffVal = filterDifficulty.value;      // all / 1 / 2 / 3
    const reasonVal = filterReason.value;        // all / label string

    let visible = 0;
    const total = data.length;

    questionBoxes.forEach((box, idx) => {
        const q = data[idx];
        let ok = true;

        // Status filter
        if (statusVal !== "all") {
            if (statusVal === "correct" && q.status !== "Correct") ok = false;
            else if (statusVal === "incorrect" && q.status !== "Incorrect") ok = false;
            else if (statusVal === "unattempted" && q.status !== null) ok = false;
        }

        // Difficulty filter
        if (ok && diffVal !== "all") {
            const diffNum = Number(diffVal);
            if (q.difficulty !== diffNum) ok = false;
        }

        // Reason filter
        if (ok && reasonVal !== "all") {
            if (q.option !== reasonVal) ok = false;
        }

        if (ok) {
            box.style.display = "";
            visible++;
        } else {
            box.style.display = "none";
        }
    });

    // Update the count text
    if (filterCount) {
        filterCount.textContent = `Showing ${visible} / ${total} questions`;
    }
}


/* Charts: Difficulty Pie + Correct Reasons Bar + Incorrect Reasons Bar */
function updateCharts(diff, correctMap, incorrectMap) {
    const diffCanvas = document.getElementById("difficultyPie");
    const correctCanvas = document.getElementById("correctBar");
    const incorrectCanvas = document.getElementById("incorrectBar");
    if (!diffCanvas || !correctCanvas || !incorrectCanvas || typeof Chart === "undefined") return;

    const diffCtx = diffCanvas.getContext("2d");
    const correctCtx = correctCanvas.getContext("2d");
    const incorrectCtx = incorrectCanvas.getContext("2d");

    // ----- Difficulty Pie -----
    const diffData = [diff.easy, diff.medium, diff.hard];
    const diffLabels = ["Easy", "Medium", "Hard"];

    if (!difficultyChart) {
        difficultyChart = new Chart(diffCtx, {
            type: "pie",
            data: {
                labels: diffLabels,
                datasets: [{
                    data: diffData,
                    backgroundColor: [
                        "rgba(76, 175, 80, 0.8)",   // Easy
                        "rgba(255, 193, 7, 0.8)",   // Medium
                        "rgba(244, 67, 54, 0.8)"    // Hard
                    ],
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.6)"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 16 }
                    }
                }
            }
        });
    } else {
        difficultyChart.data.datasets[0].data = diffData;
        difficultyChart.update();
    }

    // ----- Correct Reasons Bar -----
    const correctLabelsOrdered = correctLabels;
    const correctData = correctLabelsOrdered.map(label => correctMap[label]);

    if (!correctChart) {
        correctChart = new Chart(correctCtx, {
            type: "bar",
            data: {
                labels: correctLabelsOrdered,
                datasets: [{
                    data: correctData,
                    backgroundColor: "rgba(76, 175, 80, 0.8)",
                    borderColor: "rgba(255,255,255,0.7)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: "y",
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        correctChart.data.datasets[0].data = correctData;
        correctChart.update();
    }

    // ----- Incorrect Reasons Bar -----
    const incorrectLabelsOrdered = incorrectLabels;
    const incorrectData = incorrectLabelsOrdered.map(label => incorrectMap[label]);

    if (!incorrectChart) {
        incorrectChart = new Chart(incorrectCtx, {
            type: "bar",
            data: {
                labels: incorrectLabelsOrdered,
                datasets: [{
                    data: incorrectData,
                    backgroundColor: "rgba(33, 150, 243, 0.8)",
                    borderColor: "rgba(255,255,255,0.7)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: "y",
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        incorrectChart.data.datasets[0].data = incorrectData;
        incorrectChart.update();
    }
}


/* Reset All */
resetBtn.onclick = () => {
    data = Array(100).fill(null).map(() => ({
        status: null, option: null, difficulty: 0
    }));
    document.querySelectorAll(".correct-btn, .incorrect-btn").forEach(btn => btn.classList.remove("selected"));
    document.querySelectorAll(".option-container").forEach(o => o.innerHTML = "");
    document.querySelectorAll(".qStar").forEach(s => {
        s.classList.remove("filled");
        s.textContent = "☆";
    });
    document.querySelectorAll(".difficultyText").forEach(t => t.textContent = "Difficulty: Not Selected");
    document.querySelectorAll(".statusText").forEach(t => t.textContent = "Status: Not Selected");
    updateReport();
    filterStatus.value = "all";
    filterDifficulty.value = "all";
    filterReason.value = "all";
    applyFilter();
};


[filterStatus, filterDifficulty, filterReason].forEach(sel => {
    sel.addEventListener("change", applyFilter);
});


/* Dark mode */
const themeBtn = document.getElementById("themeToggleBtn");
document.body.classList.add("dark");
themeBtn.onclick = () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "🔆";  // Sun icon for light mode button
    } else {
        themeBtn.textContent = "🌙";  // Moon icon for light mode button
    }
};


// disabling inspect element
document.addEventListener("contextmenu", function(e){
    e.preventDefault(); //this prevents right click
});
document.onkeydown=function(e){
    if(event.keycode==123){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="I".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="C".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="J".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.keyCode=="U".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.keyCode=="S".charCodeAt(0)){
        return false;
    }
};

// initial render for empty charts
updateReport();

// Scroll to top / bottom with smooth behavior
if (scrollToggleBtn) {
    scrollToggleBtn.onclick = () => {
        if (scrollMode === "down") {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };
}

// Show arrows only after scrolling a bit
window.addEventListener("scroll", () => {
    if (!scrollControls || !scrollToggleBtn) return;

    const currentY = window.scrollY;

    // show/hide control
    if (currentY > 250) {
        scrollControls.classList.add("visible");
    } else {
        scrollControls.classList.remove("visible");
    }

    // detect scroll direction (with small threshold to avoid jitter)
    if (currentY > lastScrollY + 5) {
        // scrolling down → show DOWN arrow
        scrollMode = "down";
        scrollToggleBtn.textContent = "⬇";
    } else if (currentY < lastScrollY - 5) {
        // scrolling up → show UP arrow
        scrollMode = "up";
        scrollToggleBtn.textContent = "⬆";
    }

    lastScrollY = currentY;
});
