window.addEventListener("load", () => {
    const player = document.querySelector(".player");
    const video = document.querySelector(".player__video");

    const progressBar = document.querySelector(".progress");
    const progressFilled = document.querySelector(".progress__filled");
    const soundRange = document.querySelector(".sound__slider");

    const playBtn = document.querySelector(".player__play");
    const soundBtn = document.querySelector(".player__sound i");
    const settingsBtn = document.querySelector(".player__settings");
    const fullScrBtn = document.querySelector(".player__full-screen");

    const skipStep = 5;

    let currentVolume = 0.5;
    let currentTime = 0;
    let duration = 0;

    let timeUpdateInterval = null;
    let loadDuration = null;
    let timeoutNotMove = null;

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

        if (hour != 0)
            return `${hour}:${minute.padStart(2, "0")}:${second.padStart(
                2,
                "0"
            )}`;
        return `${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
    }

    loadDuration = setInterval(function () {
        if (video.readyState > 0) {
            duration = video.duration;
            durationTimeSpan.innerHTML = toStringTime(duration);
            currentTimeSpan.innerHTML = toStringTime(currentTime);
            clearInterval(loadDuration);
        }
    }, 500);

    function toggleControls(event){
        if(event.type=="mouseleave" && !video.paused) player.classList.remove("is-open");
        else player.classList.add("is-open");
    }

    function handlePlayBtn() {
        if (!playBtn.classList.contains("playing")) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.classList.add("playing");
            video.play();
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove("playing");
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

    // update time and bar
    function updateTime() {
        console.log("playing triggered");
        timeUpdateInterval = setInterval(() => {
            currentTime = video.currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
            let currentLengthOfBar = (currentTime / duration) * 100;
            progressFilled.style.flexBasis = `${currentLengthOfBar}%`;
            console.log("sss");
        }, 1000);
    }

    /* clear old interval */
    function clearUpdateTime() {
        clearInterval(timeUpdateInterval);
        console.log("pause");
    }

    // when video is ended, change the button
    function updateButton() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove("playing");
        currentTime=duration;
        progressFilled.style.flexBasis = `100%`;
        currentTimeSpan.innerHTML=toStringTime(currentTime);
    }

    video.addEventListener("playing", updateTime);
    video.addEventListener("pause", clearUpdateTime);
    video.addEventListener("pause",toggleControls);
    video.addEventListener("ended", updateButton);

    player.addEventListener("mouseenter",toggleControls);
    player.addEventListener("mouseleave",toggleControls);

    // when mousedown and video is playing, it will clear old Interval, it's also trigger the playing event, mean it's will trigger the update time
    // and that interval will be deleted when video is paused (pause event) or we mousedown, clear old interval start the new one and so one.
    // This created because if we don't clear old interval, it's still work, and i think, it will decrease our program speed :)
    // when mousedown and video is not playing, it won't trigger the playing event, that's mean update time not work, we need to update the time,
    // the bar, the currentTime. no need to clear interval because there is no fucking interval :)) it's was cleared in the previous pause.

    function changeVideoTime(event) {
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        currentTime = (event.offsetX / this.offsetWidth) * duration;
        video.currentTime = currentTime;
        let currentLengthOfBar = (currentTime / duration) * 100;
        progressFilled.style.flexBasis = `${currentLengthOfBar}%`;
        currentTimeSpan.innerHTML = toStringTime(currentTime);
        console.log("mousedown triggered");
    }
    progressBar.addEventListener("mousedown", changeVideoTime);

    function toggleFullScreen() {
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.mozRequestFullScreen) {
            /* Firefox */
            player.mozRequestFullScreen();
        } else if (player.webkitRequestFullscreen) {
            /* Chrome, Safari & Opera */
            player.webkitRequestFullscreen();
        } else if (player.msRequestFullscreen) {
            /* IE/Edge */
            player.msRequestFullscreen();
        }
    }
    fullScrBtn.addEventListener("click", toggleFullScreen);

    function toggleVideoWithoutBtn(event) {
        if (event.target == video) {
            handlePlayBtn();
        }
    }
    player.addEventListener("click", toggleVideoWithoutBtn);

    function skip(event) {
        if (event.code == "ArrowRight") {
            clearInterval(timeUpdateInterval);
            currentTime += skipStep;
            video.currentTime = currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
        }
        if (event.code == "ArrowLeft") {
            clearInterval(timeUpdateInterval);
            currentTime -= skipStep;
            video.currentTime = currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
        }
    }
    window.addEventListener("keydown", skip);

    function handleSettings() {
        if (!this.classList.contains("is-open")) {
            this.classList.add("is-open");
        } else {
            this.classList.remove("is-open");
        }
    }
    settingsBtn.addEventListener("click", handleSettings);

    // if after 3 seconds u don't move your mouse, controls bar will be hidden
    function clearTimeoutWhenNotMove(){
        clearTimeout(timeoutNotMove);
    }

    video.addEventListener("pause",clearTimeoutWhenNotMove);
    player.addEventListener("mouseleave",clearTimeoutWhenNotMove);

    function hideControlsWhenNotMove(event){
        if(video.paused) {
            console.log("deo dc");
            return;
        }
        console.log("dc ban");
        player.classList.add("is-open");
        clearTimeout(timeoutNotMove);
        timeoutNotMove=setTimeout(()=>{
            player.classList.remove("is-open");
            console.log("che ne");
        },3000);
    }

    player.addEventListener("mousemove",hideControlsWhenNotMove);
});



