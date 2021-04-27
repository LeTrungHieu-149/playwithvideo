window.addEventListener("load", () => {
    const player = document.querySelector(".player");
    const video = document.querySelector(".player__video");

    const progressBar = document.querySelector(".progress");
    const progressFilled = document.querySelector(".progress__filled");
    const progressHoverBtn = document.querySelector(".progress__hover-button");
    const progressBuffer = document.querySelector(".progress__buffer");
    const progressHoverBar = document.querySelector(".progress__hover-bar");
    const soundRange = document.querySelector(".sound__slider");

    const playBtn = document.querySelector(".player__play");
    const soundBtn = document.querySelector(".player__sound i");
    const settingsBtn = document.querySelector(".player__settings");
    const fullScrBtn = document.querySelector(".player__full-screen");
    const speedListBtn = document.querySelectorAll(".speed__list li");

    const currentTimeSpan = document.querySelector(".current-time");
    const durationTimeSpan = document.querySelector(".duration");

    const skipStep = 5;

    let currentVolume = 0.5;
    let currentTime = 0;
    let duration = 0;
    let bufferIndex = 0;

    let loadDuration = null;
    let timeoutNotMove = null;

    let mouseIsHolding = false;

    //parse time in seconds to string
    function toStringTime(timeInSeconds) {
        timeInSeconds = parseInt(timeInSeconds);
        let hour = Math.floor(timeInSeconds / 3600);
        let minute = Math.floor((timeInSeconds - hour * 3600) / 60);
        let second = timeInSeconds - 60 * minute - hour * 3600;
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

    //load video duration
    loadDuration = setInterval(function () {
        if (video.readyState > 0) {
            duration = video.duration;
            durationTimeSpan.innerHTML = toStringTime(duration);
            currentTimeSpan.innerHTML = toStringTime(currentTime);
            clearInterval(loadDuration);
        }
    }, 500);

    // toggle controls bar
    function toggleControls(event) {
        if (event.type == "mouseleave" && !video.paused)
            player.classList.remove("is-open");
        else player.classList.add("is-open");
    }
    video.addEventListener("pause", toggleControls);
    player.addEventListener("mouseenter", toggleControls);
    player.addEventListener("mouseleave", toggleControls);

    // toggle player button
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

    // handle sound range
    function handleSound() {
        video.volume = this.value / 100;
        if (this.value == 0)
            this.parentElement.parentElement.classList.add("muted");
        else this.parentElement.parentElement.classList.remove("muted");
        currentVolume = video.volume;
    }
    soundRange.addEventListener("input", handleSound);

    // toggle sound button
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

    // find index of current buffer in time ranges object
    function findIndexOfBuffer() {
        let bufferedLength = video.buffered.length;
        for (let i = 0; i < bufferedLength; i++) {
            if (video.buffered.end(i) > currentTime) return i;
        }
    }

    //when time update, change bar's length, time
    function updateTime() {
        currentTime = video.currentTime;
        currentTimeSpan.innerHTML = toStringTime(currentTime);
        let currentLengthOfProgressBar = currentTime / duration;
        progressFilled.style.transform = `scaleX(${currentLengthOfProgressBar})`;
        progressHoverBtn.style.left = `${currentLengthOfProgressBar * 100}%`;
    }
    video.addEventListener("timeupdate", updateTime);

    // when video is ended, change the button
    function updateButton() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.classList.remove("playing");
    }
    video.addEventListener("ended", updateButton);

    //progress event trigger when video is loading to buffer, update buffer bar's length
    function updateBuffer() {
        bufferIndex = findIndexOfBuffer();
        let currentLengthOfBufferBar =
            video.buffered.end(bufferIndex) / duration;
        progressBuffer.style.transform = `scaleX(${currentLengthOfBufferBar})`;
    }
    video.addEventListener("progress", updateBuffer);
    video.addEventListener("seeked", updateBuffer);

    //when mouse down, trigger change video time,add event listener to check dragging
    function changeVideoTime(event) {
        mouseIsHolding = true;
        let currentX = event.pageX - progressBar.getBoundingClientRect().x;
        currentTime = (currentX / progressBar.offsetWidth) * duration;
        video.currentTime = currentTime;
        window.addEventListener("mousemove", changeVideoTimeWhenHolding);
        window.addEventListener("mouseup", mouseupHandle);
    }
    progressBar.addEventListener("mousedown", changeVideoTime);

    //when mousemove, check if mouse is holding to seek
    function changeVideoTimeWhenHolding(event) {
        if (mouseIsHolding) {
            makeProgressBarBigger();
            let currentX = event.pageX - progressBar.getBoundingClientRect().x;
            if (currentX > progressBar.offsetWidth)
                currentX = progressBar.offsetWidth;
            if (currentX < 0) currentX = 0;
            currentTime = (currentX / progressBar.offsetWidth) * duration;
            video.currentTime = currentTime;
        }
    }

    //when mouse up, remove unnecessary listener, update mouse holding status
    function mouseupHandle() {
        if (mouseIsHolding) {
            mouseIsHolding = false;
            window.removeEventListener("mousemove", changeVideoTimeWhenHolding);
            window.removeEventListener("mouseup", mouseupHandle);
        }
    }

    //when mouseenter in progress bar, increase it's size and vice versa
    function makeProgressBarBigger() {
        progressBar.classList.add("progress--bigger");
    }

    function resetSizeForProgressBarAndHideHoverBar() {
        progressBar.classList.remove("progress--bigger");
        progressHoverBar.style.transform = `scaleX(0)`;
    }

    function showHoverBar(event) {
        let currentX = event.pageX - progressBar.getBoundingClientRect().x;
        let currentLengthOfHoverBar = currentX / progressBar.offsetWidth;
        progressHoverBar.style.transform = `scaleX(${currentLengthOfHoverBar})`;
    }
    progressBar.addEventListener(
        "mouseleave",
        resetSizeForProgressBarAndHideHoverBar
    );
    progressBar.addEventListener("mouseenter", makeProgressBarBigger);
    progressBar.addEventListener("mousemove", showHoverBar);

    //toggle full screen - copy and paste from w3school with love :))
    let toggleFullScreen = (function toggleFullScreenClosure() {
        let isFullScr = false;
        function toggle() {
            if (isFullScr) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    /* IE11 */
                    document.msExitFullscreen();
                }
                isFullScr = false;
            } else {
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
                isFullScr = true;
            }
        }
        return toggle;
    })();

    fullScrBtn.addEventListener("click", toggleFullScreen);

    //click on video player to toggle video
    function toggleVideoWithoutBtn(event) {
        if (event.target == video) {
            handlePlayBtn();
        }
    }
    player.addEventListener("click", toggleVideoWithoutBtn);

    //skip
    function skip(event) {
        if (event.code == "ArrowRight") {
            currentTime += skipStep;
            video.currentTime = currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
        }
        if (event.code == "ArrowLeft") {
            currentTime -= skipStep;
            video.currentTime = currentTime;
            currentTimeSpan.innerHTML = toStringTime(currentTime);
        }
    }
    window.addEventListener("keydown", skip);

    //handle setting button, just it's appearance :))
    function handleSettings() {
        if (!this.classList.contains("is-open")) {
            this.classList.add("is-open");
        } else {
            this.classList.remove("is-open");
        }
    }
    settingsBtn.addEventListener("click", handleSettings);

    speedListBtn.forEach((item) => {
        item.addEventListener("click", () => {
            video.playbackRate = item.innerHTML;
            console.log(video.playbackRate);
        });
    });

    // if after 3 seconds u don't move your mouse, controls bar will be hidden
    function clearTimeoutWhenNotMove() {
        clearTimeout(timeoutNotMove);
    }

    function hideControlsWhenNotMove() {
        if (video.paused) return;
        player.classList.add("is-open");
        clearTimeout(timeoutNotMove);
        timeoutNotMove = setTimeout(() => {
            player.classList.remove("is-open");
        }, 3000);
    }
    player.addEventListener("mousemove", hideControlsWhenNotMove);
    player.addEventListener("mouseleave", clearTimeoutWhenNotMove);
    video.addEventListener("pause", clearTimeoutWhenNotMove);
});
