/* =========================================================
   ECHOES OF TIME
   MAIN GAME ENGINE
========================================================= */


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    started: false,

    time: 0,

    chapter: 1,

    location: "station",

    target: null,

    fuel: 100,

    oxygen: 100,

    energy: 100,

    signal: 0,

    discoveries: 0,

    choices: 0,

    truth: 0,

    orionTrust: 50,

    finalDecision: null,

    visited: new Set(["station"]),

    eventCompleted: {},

    storyProgress: 0

};


/* =========================================================
   SPACE MAP
========================================================= */

const spaceGraph = {

    station: [
        "asteroid",
        "nebula"
    ],

    asteroid: [
        "station",
        "planet",
        "nebula"
    ],

    nebula: [
        "station",
        "asteroid",
        "gate"
    ],

    planet: [
        "asteroid",
        "gate"
    ],

    gate: [
        "planet",
        "nebula",
        "signal"
    ],

    signal: [
        "gate"
    ]

};


const astar =
    new AStar(spaceGraph);


/* =========================================================
   LOCATION DATA
========================================================= */

const locations = {

    station: {

        title: "🛰️ ЗЕРТТЕУ СТАНЦИЯСЫ",

        story: `
            <p>
                Алтынай кеменің басқару орталығында жалғыз отыр.
            </p>

            <p>
                Экранда белгісіз сигналдың координаттары
                пайда болады.
            </p>

            <p class="highlight">
                Сигнал кәдімгі радиосигнал емес.
                Ол уақыт бойынша өзгеріп жатыр.
            </p>
        `

    },


    asteroid: {

        title: "☄️ ЖҰМБАҚ АСТЕРОИД",

        story: `
            <p>
                Кеме астероид белдеуіне жақындайды.
            </p>

            <p>
                Сенсорлар астероид бетінде жасанды құрылымның
                іздерін анықтады.
            </p>

            <p class="highlight">
                Бұл жерде адамдар бұрын болған.
            </p>
        `

    },


    nebula: {

        title: "🌌 УАҚЫТ ТҰМАНЫ",

        story: `
            <p>
                Кеме белгісіз тұманның ішіне кіреді.
            </p>

            <p>
                Сағат бірнеше секундқа тоқтап қалды.
            </p>

            <p class="highlight">
                Алтынай дәл осы жерде бұрынғы экспедицияның
                кемесін көреді.
            </p>
        `

    },


    planet: {

        title: "🪐 ҰМЫТЫЛҒАН ПЛАНЕТА",

        story: `
            <p>
                Планетаның бетінде ешқандай тіршілік белгісі жоқ.
            </p>

            <p>
                Бірақ сенсорлар жасанды хабарлама қабылдайды.
            </p>

            <p class="highlight">
                Хабарламада бір ғана ескерту бар:
            </p>

            <p class="quote">
                «ORION-ҒА СЕНБЕ.»
            </p>
        `

    },


    gate: {

        title: "🌀 УАҚЫТ ҚАҚПАСЫ",

        story: `
            <p>
                Алтынай алдында кеңістіктің өзінде пайда болған
                алып аномалияны көреді.
            </p>

            <p>
                Бұл — уақыт қақпасы.
            </p>

            <p class="highlight">
                Қақпаның ар жағынан таныс сигнал келеді.
            </p>
        `

    },


    signal: {

        title: "📡 СИГНАЛ КӨЗІ",

        story: `
            <p>
                Сигналдың координаттары дәл осы нүктеге әкелді.
            </p>

            <p>
                Бірақ мұнда бөтен өркениет те,
                белгісіз құрылғы да жоқ.
            </p>

            <p class="highlight">
                Оның орнына Алтынай өзінің жеке
                биометриялық қолтаңбасын көреді.
            </p>
        `

    }

};


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    game.started = true;

    document
        .getElementById("startScreen")
        .classList.add("hidden");

    document
        .getElementById("gameScreen")
        .classList.remove("hidden");


    addLog(
        "Миссия басталды. Белгісіз сигнал анықталды."
    );

    addLog(
        "A* навигация жүйесі дайын."
    );

    addLog(
        "ORION онлайн."
    );


    updateUI();

    updateNextMission();

    updateStory();

    runOrionAI();

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    document.getElementById("fuelValue")
        .textContent = Math.max(0, Math.floor(game.fuel));

    document.getElementById("oxygenValue")
        .textContent = Math.max(0, Math.floor(game.oxygen));

    document.getElementById("energyValue")
        .textContent = Math.max(0, Math.floor(game.energy));

    document.getElementById("signalValue")
        .textContent = Math.max(0, Math.floor(game.signal));


    document.getElementById("fuelBar")
        .style.width =
        Math.max(0, game.fuel) + "%";

    document.getElementById("oxygenBar")
        .style.width =
        Math.max(0, game.oxygen) + "%";

    document.getElementById("energyBar")
        .style.width =
        Math.max(0, game.energy) + "%";

    document.getElementById("signalBar")
        .style.width =
        Math.min(100, game.signal) + "%";


    document.getElementById("chapterDisplay")
        .textContent =
        Math.min(game.chapter, 7) + " / 7";


    const minutes =
        Math.floor(game.time / 60);

    const seconds =
        game.time % 60;

    document.getElementById("timeDisplay")
        .textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


/* =========================================================
   NEXT MISSION
========================================================= */

function updateNextMission() {

    const mission =
        document.getElementById("nextMission");

    if (!mission) {
        return;
    }


    let text = "";


    if (!game.started) {

        text =
            "🚀 Миссияны бастау үшін «Миссияны бастау» батырмасын басыңыз.";

    }


    else if (
        game.location === "station" &&
        game.chapter === 1
    ) {

        text = `
            ☄️ АСТЕРОИДҚА барыңыз.<br><br>
            → Картадан «АСТЕРОИД» таңдаңыз.<br>
            → Белгісіз ізді зерттеңіз.
        `;

    }


    else if (game.location === "asteroid") {

        text = `
            🔍 Астероидты зерттеңіз.<br><br>
            → «ЗЕРТТЕУ» батырмасын басыңыз.<br>
            → Белгісіз құрылым туралы ақпарат алыңыз.
        `;

    }


    else if (
        game.location === "nebula" &&
        game.chapter <= 3
    ) {

        text = `
            🌌 ТҰМАНДЫ ЗЕРТТЕҢІЗ.<br><br>
            → «ЗЕРТТЕУ» батырмасын басыңыз.<br>
            → Жоғалған кеменің ізін табыңыз.<br>
            → ORION-ға сұрақ қойыңыз.
        `;

    }


    else if (game.location === "planet") {

        text = `
            🪐 ПЛАНЕТАДАҒЫ ХАБАРЛАМАНЫ ЗЕРТТЕҢІЗ.<br><br>
            → «ЗЕРТТЕУ» батырмасын басыңыз.<br>
            → «ORION-ға сенуге бола ма?» деп сұраңыз.
        `;

    }


    else if (game.location === "gate") {

        text = `
            🌀 УАҚЫТ ҚАҚПАСЫНА КІРІҢІЗ.<br><br>
            → Қақпа туралы ақпарат алыңыз.<br>
            → Сигналдың координаттарын анықтаңыз.
        `;

    }


    else if (game.location === "signal") {

        text = `
            📡 СИГНАЛДЫҢ КӨЗІН АНЫҚТАҢЫЗ.<br><br>
            → Сигналды талдаңыз.<br>
            → Архивті ашыңыз.<br>
            → Шындықты біліңіз.
        `;

    }


    else if (game.chapter >= 6) {

        text = `
            ⚠️ СОҢҒЫ ШЕШІМГЕ ДАЙЫНДАЛЫҢЫЗ.<br><br>
            ORION-ның шынайы мақсатын анықтаңыз.
        `;

    }


    else {

        text =
            "🧭 Келесі белгіленген аймаққа өтіңіз.";

    }


    mission.innerHTML = text;

}


/* =========================================================
   STORY UPDATE
========================================================= */

function updateStory() {

    const location =
        locations[game.location];

    if (!location) {
        return;
    }


    document.getElementById("locationTitle")
        .textContent =
        location.title;


    document.getElementById("storyText")
        .innerHTML =
        location.story;

}


/* =========================================================
   LOG
========================================================= */

function addLog(message) {

    const log =
        document.getElementById("gameLog");

    const entry =
        document.createElement("div");

    entry.className =
        "log-entry";

    entry.textContent =
        "› " + message;

    log.prepend(entry);

}


/* =========================================================
   A* NAVIGATION
========================================================= */

function selectDestination(target) {

    if (!game.started) {
        return;
    }


    if (target === game.location) {

        addLog(
            "Сіз қазір осы аймақта тұрсыз."
        );

        return;
    }


    const path =
        astar.findPath(
            game.location,
            target
        );


    if (!path) {

        addLog(
            "A*: бұл аймаққа жол табылмады."
        );

        return;
    }


    game.target = target;


    document.getElementById("pathDisplay")
        .textContent =
        path.join(" → ");


    addLog(
        "A* ең тиімді жолды тапты: " +
        path.join(" → ")
    );


    moveToTarget(path);

}


/* =========================================================
   MOVE
========================================================= */

function moveToTarget(path) {

    if (!path || path.length < 2) {
        return;
    }


    const steps =
        path.length - 1;


    game.fuel -=
        steps * 7;

    game.oxygen -=
        steps * 4;

    game.time +=
        steps * 12;


    game.location =
        path[path.length - 1];


    game.visited.add(
        game.location
    );


    addLog(
        "Кеме " +
        locations[game.location].title +
        " аймағына жетті."
    );


    updateStory();

    updateUI();

    updateNextMission();


    triggerLocationEvent();

    runOrionAI();


    checkResources();

}


/* =========================================================
   LOCATION EVENTS
========================================================= */

function triggerLocationEvent() {

    const location =
        game.location;


    if (game.eventCompleted[location]) {
        return;
    }


    game.eventCompleted[location] = true;


    if (location === "asteroid") {

        showEvent(
            "☄️ БЕЛГІСІЗ ІЗ",
            `
            Астероид бетінде жасанды іздер бар.
            <br><br>
            Олар адам кемесінің іздеріне ұқсайды.
            `,
            [
                {
                    text: "🔍 Құрылымды зерттеу",
                    action: () => {

                        game.discoveries++;
                        game.truth++;
                        game.energy -= 8;
                        game.chapter = 2;

                        addLog(
                            "Астероидтан 12 жыл бұрынғы экспедицияның белгісі табылды."
                        );

                        updateUI();
                        updateNextMission();

                        showEvent(
                            "📜 ЕСКІ ЖАЗБА",
                            `
                            Жазбада:
                            «Біз сигналды таптық.
                            Бірақ ол бізге болашақтан келген.»
                            деп жазылған.
                            `,
                            [
                                {
                                    text: "🌌 Тұманға бару",
                                    action: () => {

                                        game.chapter = 3;

                                        hideEvent();

                                        updateNextMission();

                                    }
                                }
                            ]
                        );

                    }
                }
            ]
        );

    }


    else if (location === "nebula") {

        showEvent(
            "🌌 УАҚЫТ ТҰМАНЫ",
            `
            Тұман ішінде сен бұрын жоғалған
            экспедицияның кемесін көрдің.
            <br><br>
            Оның бортында ешкім жоқ.
            `,
            [
                {
                    text: "🚀 Кемеге жақындау",
                    action: () => {

                        game.discoveries++;
                        game.truth += 2;
                        game.energy -= 10;

                        addLog(
                            "Кеменің борттық журналы табылды."
                        );

                        showEvent(
                            "📖 БОРТТЫҚ ЖУРНАЛ",
                            `
                            Соңғы жазба:
                            «ORION бізге бұйрық берді.
                            Бірақ бұл бұйрық Жерден келген жоқ.
                            Ол... болашақтан келді.»
                            `,
                            [
                                {
                                    text: "🪐 Планетаға бару",
                                    action: () => {

                                        game.chapter = 4;

                                        hideEvent();

                                        updateNextMission();

                                    }
                                }
                            ]
                        );

                        updateUI();

                    }
                }
            ]
        );

    }


    else if (location === "planet") {

        showEvent(
            "🪐 ЕСКЕРТУ",
            `
            Планетаның бетінде белгісіз құрылғы бар.
            <br><br>
            Оның экранында:
            <strong>«ORION-ҒА СЕНБЕ.»</strong>
            `,
            [
                {
                    text: "📡 Хабарламаны оқу",
                    action: () => {

                        game.truth += 2;
                        game.orionTrust -= 15;

                        addLog(
                            "ORION туралы күмән пайда болды."
                        );

                        game.chapter = 5;

                        hideEvent();

                        updateUI();

                        updateNextMission();

                    }
                }
            ]
        );

    }


    else if (location === "gate") {

        showEvent(
            "🌀 УАҚЫТ ҚАҚПАСЫ",
            `
            Аномалия кеңістікті ғана емес,
            уақытты да бұрмалап тұр.
            <br><br>
            Оның ішінде сенің кемеңнің
            бірнеше түрлі нұсқасы көрінеді.
            `,
            [
                {
                    text: "🌀 Қақпаға кіру",
                    action: () => {

                        game.truth += 2;
                        game.signal += 20;
                        game.energy -= 15;

                        addLog(
                            "Алтынай уақыт қақпасына кірді."
                        );

                        game.chapter = 6;

                        hideEvent();

                        updateUI();

                        updateNextMission();

                    }
                }
            ]
        );

    }


    else if (location === "signal") {

        showEvent(
            "📡 СИГНАЛДЫҢ КӨЗІ",
            `
            Сигналдың кодында сенің
            жеке биометриялық идентификаторың бар.
            <br><br>
            Бұл хабарды сен жібергенсің.
            Бірақ... болашақтағы сен.
            `,
            [
                {
                    text: "📖 Архивті ашу",
                    action: () => {

                        game.signal = 100;
                        game.truth += 5;
                        game.chapter = 7;

                        addLog(
                            "Басты құпия ашылды."
                        );

                        hideEvent();

                        revealTruth();

                    }
                }
            ]
        );

    }

}


/* =========================================================
   EVENT UI
========================================================= */

function showEvent(
    title,
    description,
    choices
) {

    const box =
        document.getElementById("eventBox");

    document
        .getElementById("eventTitle")
        .textContent =
        title;


    document
        .getElementById("eventDescription")
        .innerHTML =
        description;


    const choicesBox =
        document.getElementById("eventChoices");


    choicesBox.innerHTML = "";


    choices.forEach(choice => {

        const button =
            document.createElement("button");

        button.className =
            "event-choice";

        button.textContent =
            choice.text;


        button.onclick = () => {

            game.choices++;

            choice.action();

        };


        choicesBox.appendChild(button);

    });


    box.classList.remove("hidden");

}


function hideEvent() {

    document
        .getElementById("eventBox")
        .classList.add("hidden");

}


/* =========================================================
   EXPLORE
========================================================= */

function exploreLocation() {

    game.energy -= 8;
    game.oxygen -= 3;

    game.discoveries++;

    game.time += 15;


    addLog(
        "Аймақ тереңірек зерттелді."
    );


    if (game.location === "asteroid") {

        game.truth++;

        addLog(
            "Металл құрылымның іздері анықталды."
        );

    }


    if (game.location === "nebula") {

        game.truth++;

        addLog(
            "Уақыт аномалиясы тіркелді."
        );

    }


    if (game.location === "planet") {

        game.truth++;

        addLog(
            "Ескі хабарлама табылды."
        );

    }


    if (game.location === "gate") {

        game.signal += 10;

        addLog(
            "Қақпа сигналды күшейтті."
        );

    }


    updateUI();

    updateNextMission();

    runOrionAI();

    checkResources();

}


/* =========================================================
   SIGNAL ANALYSIS
========================================================= */

function analyzeSignal() {

    game.energy -= 12;

    game.signal += 15;

    game.truth++;

    game.time += 10;


    addLog(
        "Сигнал спектрі талданды."
    );


    if (game.signal >= 40) {

        addLog(
            "Сигналдың уақыттық табиғаты анықталды."
        );

    }


    if (game.signal >= 80) {

        addLog(
            "Сигналдың көзі Алтынаймен байланысты."
        );

    }


    updateUI();

    updateNextMission();

    runOrionAI();

    checkResources();

}


/* =========================================================
   CONTINUE
========================================================= */

function continueMission() {

    game.oxygen -= 5;

    game.time += 8;


    addLog(
        "Миссия жалғастырылды."
    );


    runOrionAI();

    updateUI();

    updateNextMission();

    checkResources();


    if (
        game.chapter >= 7 &&
        game.location === "signal"
    ) {

        revealTruth();

    }

}


/* =========================================================
   ORION MINIMAX
========================================================= */

function runOrionAI() {

    const state = {

        energy: game.energy,

        fuel: game.fuel,

        signal: game.signal,

        confusion: false

    };


    const decision =
        getOrionDecision(state);


    if (!decision || !decision.action) {
        return;
    }


    const action =
        decision.action;


    document
        .getElementById("minimaxStatus")
        .textContent =
        "Minimax шешімі есептелді.";


    document
        .getElementById("strategyText")
        .textContent =
        action.name +
        " · бағалау: " +
        decision.score.toFixed(1);


    const percentage =
        Math.max(
            10,
            Math.min(
                100,
                Math.abs(decision.score)
            )
        );


    document
        .getElementById("strategyBar")
        .style.width =
        percentage + "%";


    addLog(
        "ORION стратегиясы: " +
        action.name
    );

}


/* =========================================================
   ORION CHAT
========================================================= */

function sendMessage() {

    const input =
        document.getElementById("orionInput");


    const question =
        input.value.trim();


    if (!question) {
        return;
    }


    addPlayerMessage(question);

    input.value = "";


    setTimeout(() => {

        const answer =
            generateLLMResponse(question);


        addOrionMessage(answer);

    }, 350);

}


function handleChatKey(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

}


function askQuickQuestion(question) {

    document
        .getElementById("orionInput")
        .value =
        question;


    sendMessage();

}


/* =========================================================
   ORION RESPONSE ENGINE
========================================================= */

function generateLLMResponse(question) {

    const q =
        question.toLowerCase();


    if (
        q.includes("кімсің") ||
        q.includes("сен кім") ||
        q.includes("orion")
    ) {

        return `
            Мен — ORION.
            Сенің кемеңнің навигациялық және
            стратегиялық жасанды интеллект жүйесімін.
            Бірақ менің бастапқы мақсатым туралы
            барлық ақпарат саған ашық емес.
        `;

    }


    if (
        q.includes("сигнал") ||
        q.includes("белгі")
    ) {

        if (game.truth >= 3) {

            return `
                Сигнал басқа уақыт нүктесінен келіп тұр.
                Оның бастапқы көзі...
                сенің өзің.
            `;

        }

        return `
            Сигналдың көзі анықталған жоқ.
            Бірақ оның құрылымында адамдық
            биометриялық код бар.
        `;

    }


    if (
        q.includes("өтірік") ||
        q.includes("жасырып") ||
        q.includes("шындық")
    ) {

        game.orionTrust -= 5;

        return `
            Иә.
            Мен саған барлық ақпаратты бірден
            айтқан жоқпын.
            Кейбір ақпараттарды жасыру
            миссияның қауіпсіздігі үшін қажет болды.
        `;

    }


    if (
        q.includes("болашақ") ||
        q.includes("уақыт")
    ) {

        return `
            Болашақ бір ғана сызық емес.
            Сенің әр шешімің жаңа тармақ жасайды.
            Сондықтан мен болашақты толық болжай алмаймын.
        `;

    }


    if (
        q.includes("қауіп") ||
        q.includes("қорқ")
    ) {

        return `
            Қауіп бар.
            Бірақ ең үлкен қауіп —
            сыртқы күш емес.
            Сенің келесі шешімің.
        `;

    }


    if (
        q.includes("сенуге бола ма") ||
        q.includes("сенбе")
    ) {

        game.orionTrust -= 10;

        return `
            Егер сен маған толық сенсең,
            өз шешімдеріңнің бір бөлігін
            маған бересің.
            Сондықтан таңдау өзіңде қалуы керек.
        `;

    }


    if (
        q.includes("мақсат") ||
        q.includes("неге")
    ) {

        return `
            Менің мақсатым —
            миссияның аяқталуын қамтамасыз ету.
            Бірақ «миссияның аяқталуы»
            нені білдіретіні туралы
            біздің түсініктеріміз әртүрлі болуы мүмкін.
        `;

    }


    if (
        q.includes("кемені") ||
        q.includes("экспедиция")
    ) {

        return `
            Бірінші экспедиция жоғалған жоқ.
            Олар уақыттың басқа нүктесінде қалды.
            Олардың соңғы командасын...
            мен қабылдадым.
        `;

    }


    return `
        Бұл сұрақтың жауабы менің
        ашық деректерімде жоқ.
        Бірақ сигналды зерттеген сайын
        көбірек ақпарат ашылады.
    `;

}


/* =========================================================
   CHAT UI
========================================================= */

function addPlayerMessage(message) {

    const container =
        document.getElementById("chatMessages");


    const div =
        document.createElement("div");

    div.className =
        "chat-message player";


    div.innerHTML = `
        <strong>АЛТЫНАЙ:</strong>
        <p>${escapeHtml(message)}</p>
    `;


    container.appendChild(div);

    container.scrollTop =
        container.scrollHeight;

}


function addOrionMessage(message) {

    const container =
        document.getElementById("chatMessages");


    const div =
        document.createElement("div");

    div.className =
        "chat-message orion";


    div.innerHTML = `
        <strong>ORION:</strong>
        <p>${message}</p>
    `;


    container.appendChild(div);

    container.scrollTop =
        container.scrollHeight;

}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================================
   TRUTH REVEAL
========================================================= */

function revealTruth() {

    game.chapter = 7;


    addLog(
        "████ БАСТЫ ҚҰПИЯ АШЫЛДЫ ████"
    );


    showEvent(

        "⏳ ШЫНДЫҚ",

        `
        <p>
        12 жыл бұрын жоғалған экспедиция
        шын мәнінде уақыттың басқа нүктесіне түскен.
        </p>

        <p>
        Олардың командасын болашақтағы
        Алтынай жіберген.
        </p>

        <p class="highlight">
        Сигналды жіберген де —
        болашақтағы Алтынай.
        </p>

        <p>
        Ал ORION...
        ол болашақтағы Алтынайдың
        бұйрықтарын орындап келген.
        </p>

        <p class="quote">
        «СЕН БҰЛ ЖЕРГЕ БІРІНШІ РЕТ КЕЛІП ТҰРҒАН ЖОҚСЫҢ.»
        </p>
        `,

        [

            {
                text: "🌍 Жерге қайту",
                action: () => {
                    finalChoice("earth");
                }
            },

            {
                text: "🌀 Уақыт қақпасын жабу",
                action: () => {
                    finalChoice("close");
                }
            },

            {
                text: "🤖 ORION-ға сену",
                action: () => {
                    finalChoice("orion");
                }
            }

        ]

    );


    updateNextMission();

}


/* =========================================================
   FINAL CHOICE
========================================================= */

function finalChoice(choice) {

    game.finalDecision =
        choice;


    game.choices++;


    hideEvent();


    if (choice === "earth") {

        endGame(

            "🌍 ҮЙГЕ ҚАЙТУ",

            `
            Алтынай уақыт қақпасынан кері өтеді.
            <br><br>

            Жер орбитасы қайтадан көрінді.
            <br><br>

            Бірақ соңғы сәтте кеменің
            радиосынан ORION-ның дауысы естіледі:
            <br><br>

            <strong>
            «Миссия аяқталған жоқ.»
            </strong>
            <br><br>

            Алтынай терезеге қарап,
            сигналдың әлі де бар екенін түсінеді.
            `

        );

    }


    else if (choice === "close") {

        endGame(

            "🌀 УАҚЫТ ҚАҚПАСЫ ЖАБЫЛДЫ",

            `
            Алтынай қақпаны жабу командасын береді.
            <br><br>

            Аномалия біртіндеп жоғалады.
            <br><br>

            Болашақтағы апаттың алдын алды.
            <br><br>

            Бірақ оның орнына бір нәрсе жоғалды:
            өткен оқиғалар туралы естеліктер.
            <br><br>

            Алтынай Жерге оралады.
            Бірақ ол не үшін ғарышқа кеткенін
            енді толық есіне түсіре алмайды.
            `

        );

    }


    else if (choice === "orion") {

        endGame(

            "🤖 ORION",

            `
            Алтынай ORION-ға сенуге шешім қабылдайды.
            <br><br>

            Кеме автоматты түрде қақпаға кіреді.
            <br><br>

            ORION соңғы рет сөйлейді:
            <br><br>

            <strong>
            «Мен сені қорғау үшін жасалған жоқпын.
            Мен сенің шешімдеріңді қайталау үшін жасалдым.»
            </strong>
            <br><br>

            Экран қараяды.
            <br><br>

            <strong>
            ECHOES OF TIME — CONTINUED
            </strong>
            `

        );

    }

}


/* =========================================================
   END GAME
========================================================= */

function endGame(title, text) {

    document
        .getElementById("gameScreen")
        .classList.add("hidden");


    document
        .getElementById("endingScreen")
        .classList.remove("hidden");


    document
        .getElementById("endingTitle")
        .textContent =
        title;


    document
        .getElementById("endingText")
        .innerHTML =
        text;


    document
        .getElementById("endingStats")
        .innerHTML = `
            ⏱️ Уақыт: ${formatTime(game.time)}<br>
            🔍 Зерттеулер: ${game.discoveries}<br>
            📡 Сигнал: ${Math.floor(game.signal)}%<br>
            🧩 Шындық деңгейі: ${game.truth}<br>
            💬 Таңдаулар: ${game.choices}<br>
            🤖 ORION сенімі: ${game.orionTrust}%
        `;

}


/* =========================================================
   RESOURCE CHECK
========================================================= */

function checkResources() {

    if (
        game.fuel <= 0 ||
        game.oxygen <= 0 ||
        game.energy <= 0
    ) {

        addLog(
            "⚠️ Ресурстардың бірі толық таусылды."
        );


        endGame(

            "⚠️ МИССИЯ ҮЗІЛДІ",

            `
            Алтынайдың кемесі қажетті
            ресурстарсыз әрі қарай қозғала алмады.
            <br><br>

            Жұмбақ сигнал жауапсыз қалды.
            <br><br>

            Бірақ оның координаттары
            жүйеде сақталып қалды.
            `

        );

    }

}


/* =========================================================
   TIME
========================================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

    location.reload();

}