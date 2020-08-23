window.addEventListener("load", function (event) {

    const player = document.querySelector(".player");
    const video = document.querySelector(".player__video");

    const progressBar = document.querySelector(".progress");
    const progressFilled = document.querySelector(".progress__filled");
    const soundRange = document.querySelector(".sound__slider");

    const playBtn = document.querySelector(".player__play");
    const soundBtn = document.querySelector(".player__sound i");
    const settingsBtn = document.querySelector(".player__settings");
    const fullScrBtn = document.querySelector(".player__full-screen");

    let currentVolume = 50;
    let currentTime = 0;
    let duration = 0;

    let timeUpdateInterval=null;

    const currentTimeSpan = document.querySelector(".current-time");
    const durationTimeSpan = document.querySelector(".duration");

    function toStringTime(timeInSeconds) {
        timeInSeconds = parseInt(timeInSeconds);
        let hour = Math.floor(timeInSeconds / 3600);
        let minute = Math.floor((timeInSeconds - hour * 3600) / 60);
        let second = timeInSeconds - 60 * minute;

        hour = hour.toString();
        minute = minute.toString();
        second = second.toString();

        if (hour != 0) return `${hour}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
        return `${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
    }

    if (video.readyState === 4) {
        duration = video.duration;
        durationTimeSpan.innerHTML = toStringTime(duration);
        currentTimeSpan.innerHTML = toStringTime(currentTime);
    }

    function handlePlayBtn() {
        if (!this.classList.contains("playing")) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.classList.add("playing");
            video.play();
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.classList.remove("playing");
            video.pause();
        }
    }
    playBtn.addEventListener("click", handlePlayBtn);

    function handleSound() {
        video.volume = this.value / 100;
        if (this.value == 0)
            this.parentElement.parentElement.classList.add("muted");
        else this.parentElement.parentElement.classList.remove("muted");
        currentVolume = video.volume;
    }
    soundRange.addEventListener("input", handleSound);

    function toggleSound() {
        if (!this.parentElement.classList.contains("muted")) {
            video.volume = 0;
            soundRange.value = 0;
            this.parentElement.classList.add("muted");
        } else {
            video.volume = currentVolume;
            soundRange.value = currentVolume * 100;
            this.parentElement.classList.remove("muted");
        }
    }
    soundBtn.addEventListener("click", toggleSound);

    function updateTime() {
        timeUpdateInterval = setInterval(() => {
            durationTimeSpan.innerHTML = toStringTime(duration);
            currentTime = video.currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
            let currentLengthOfBar = currentTime / duration * 100;
            progressFilled.style.flexBasis = `${currentLengthOfBar}%`;
            console.log("sss");
        }, 1000);
    }

    function clearUpdateTime() {
        clearInterval(timeUpdateInterval);
        console.log("pause");
    }

    function updateButton() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.classList.remove("playing");
    }
    video.addEventListener("playing", updateTime);
    video.addEventListener("pause", clearUpdateTime);
    video.addEventListener("ended",updateButton);
    function changeVideoTime(event) {
        clearInterval(timeUpdateInterval);
        currentTime = event.offsetX / this.offsetWidth * duration;
        video.currentTime = currentTime;
        let currentLengthOfBar = currentTime / duration * 100;
        progressFilled.style.flexBasis = `${currentLengthOfBar}%`;
    }
    progressBar.addEventListener("mousedown", changeVideoTime);
    progressBar.addEventListener("mousedown", updateTime);
});
