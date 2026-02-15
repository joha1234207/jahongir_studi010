const carusel = document.getElementById("containers");

// ================= KARUSEL =================
function goToSlide(n) {
    carusel.style.transform = `translateX(-${100*n}vw)`;
}
window.goToSlide = goToSlide;


// ================= INIT =================
initApp();

async function initApp(){
    await loadMaqolalar();
    await loadLiriks();
    initAudioSystem();
}


// ================= MAQOLA =================
async function loadMaqolalar() {
    try {
        const response = await fetch("assets/posts/maqola.json");
        const maqollar = await response.json();

        const maqolaDiv = document.getElementById("maqola");

        maqollar.forEach(ma => {
            maqolaDiv.innerHTML += `
            <div class="maqola-quti">
                <p class="maqola-matni paragraf">${ma.maqola}</p>
                <span class="sana">${ma.sana}<br>${ma.soat}</span>
            </div>`;
        });

    } catch(error) {
        console.log("Maqola yuklanishda xato", error);
    }
}


// ================= LIRIKA =================
async function loadLiriks() {
    try {
        const response = await fetch("assets/posts/lirika.json");
        const lirika = await response.json();

        const lirikaDiv = document.getElementById("lirika");

        lirika.forEach(l => {
            lirikaDiv.innerHTML += `
                <div class="slide">
                    <audio class="audio" src="assets/liriks/${l.href}"></audio>
                    <div class="about-audio">
                        <h2 class="sarlavha-h2">${l.author}</h2>
                        <div class="control-container">
                            <button class="play-btn">Play</button>
                            <div class="progress-container">
                                <div class="progress"></div>
                            </div>
                            <div class="time">
                                <span class="current-time">0:00</span>/
                                <span class="duration">0:00</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    } catch(error) {
        console.log("Lirika yuklanishda xato", error);
    }
}


// ================= AUDIO SYSTEM =================
function initAudioSystem(){

    const slides = document.querySelectorAll('.slide');

    slides.forEach(slide => {

        const audio = slide.querySelector('audio');
        const playBtn = slide.querySelector('.play-btn');
        const progressContainer = slide.querySelector('.progress-container');
        const progress = slide.querySelector('.progress');
        const currentTimeSpan = slide.querySelector('.current-time');
        const durationSpan = slide.querySelector('.duration');

        if(!audio) return;

        // duration
        audio.addEventListener("loadedmetadata", () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60).toString().padStart(2,"0");
            durationSpan.textContent = `${minutes}:${seconds}`;
        });

        // progress update
        audio.addEventListener("timeupdate", () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + "%";

            const minutes = Math.floor(audio.currentTime / 60);
            const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2,"0");
            currentTimeSpan.textContent = `${minutes}:${seconds}`;
        });

        // play pause
        playBtn.addEventListener("click", () => {
            if(audio.paused){
                pauseAll(audio);
                audio.play();
                playBtn.textContent = "Pause";
            } else {
                audio.pause();
                playBtn.textContent = "Play";
            }
        });

        // seek
        progressContainer.addEventListener("click", e => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });

    });

    initObserver(slides);
}


// ================= PAUSE ALL =================
function pauseAll(currentAudio){
    document.querySelectorAll("audio").forEach(a => {
        if(a !== currentAudio){
            a.pause();
            const btn = a.parentElement.querySelector(".play-btn");
            if(btn) btn.textContent = "Play";
        }
    });
}


// ================= OBSERVER =================
function initObserver(slides){

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            const audio = entry.target.querySelector("audio");
            const button = entry.target.querySelector(".play-btn");

            if(!audio) return;

            if(entry.isIntersecting){
                pauseAll(audio);
                audio.play();
                if(button) button.textContent = "Pause";
            } else {
                audio.pause();
                if(button) button.textContent = "Play";
            }

        });

    }, { threshold: 0.7 });

    slides.forEach(slide => observer.observe(slide));
}