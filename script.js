const canvas = document.getElementById('overlay-canvas');
const text = document.getElementById('overlay-text');
const container = document.querySelector('.container');

const audio = document.getElementById('bg-music');
const playerToggle = document.getElementById('player-toggle');
const progressLine = document.getElementById('progress-line');
const progressPin = document.getElementById('progress-pin');
const progressContainer = document.getElementById('progress-container');

const spotifyIndicator = document.getElementById('spotify-indicator');
const spotifyTooltip = document.getElementById('spotify-tooltip');
const spotifyTrack = document.getElementById('spotify-track');
const spotifyArtist = document.getElementById('spotify-artist');

const DISCORD_ID = "1534202220931715145";
const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

let apiDone = false;
let audioDone = false;
let domDone = false;

text.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

function checkAllReady() {
    if (apiDone && audioDone && domDone) {
        text.textContent = 'Click to continue';
    }
}

function playAudio() {
    audio.play()
        .then(() => {
            playerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
        })
        .catch(() => {
            playerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
}

canvas.addEventListener('click', () => {
    if (apiDone && audioDone && domDone) {
        canvas.style.opacity = '0';
        text.style.opacity = '0';
        container.style.opacity = '1';

        playAudio();

        setTimeout(() => {
            canvas.style.display = 'none';
            text.style.display = 'none';
        }, 600);
    }
});

playerToggle.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audio.pause();
        playerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        if (!isNaN(progress)) {
            progressLine.style.width = `${progress}%`;
            progressPin.style.left = `${progress}%`;
        }
    }
});

progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration && width > 0) {
        const newTime = (clickX / width) * audio.duration;
        audio.currentTime = newTime;
    }
});

async function fetchDiscordData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const resData = await response.json();

        if (resData.success && resData.data) {
            const data = resData.data;
            const user = data.discord_user;
            document.getElementById('discord-name').textContent = user.global_name || user.username;

            const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
                : DEFAULT_AVATAR;

            const img = new Image();
            img.src = avatarUrl;
            img.onload = () => {
                document.getElementById('discord-avatar').style.backgroundImage = `url('${avatarUrl}')`;
                document.getElementById('track-cover').style.backgroundImage = `url('${avatarUrl}')`;
            };

            if (data.listening_to_spotify && data.spotify) {
                spotifyTrack.textContent = data.spotify.song;
                spotifyArtist.textContent = data.spotify.artist;
                spotifyIndicator.classList.add('active');
                spotifyTooltip.classList.add('has-track');
            } else {
                spotifyIndicator.classList.remove('active');
                spotifyTooltip.classList.remove('has-track');
            }
        }
    } catch (error) {
        document.getElementById('discord-name').textContent = "wiskas";
        spotifyIndicator.classList.remove('active');
        spotifyTooltip.classList.remove('has-track');
    } finally {
        if (!apiDone) {
            apiDone = true;
            checkAllReady();
        }
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

if (audio.readyState >= 4) {
    audioDone = true;
} else {
    audio.addEventListener('canplaythrough', () => {
        audioDone = true;
        checkAllReady();
    }, { once: true });
    setTimeout(() => {
        if (!audioDone) {
            audioDone = true;
            checkAllReady();
        }
    }, 5000);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    domDone = true;
    checkAllReady();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        domDone = true;
        checkAllReady();
    });
}

resizeCanvas();
fetchDiscordData();
setInterval(fetchDiscordData, 6000);