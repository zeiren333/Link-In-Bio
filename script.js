const canvas = document.getElementById('overlay-canvas');
const text = document.getElementById('overlay-text');
const container = document.querySelector('.container');
const audio = document.getElementById('bg-music');
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
function checkAllReady() {if (apiDone && audioDone && domDone) {text.textContent = 'Click to continue';}}
function playAudio() {audio.play().catch(() => {});}
canvas.addEventListener('click', () => {
    if (apiDone && audioDone && domDone) {
        canvas.style.opacity = '0';
        text.style.opacity = '0';
        container.style.opacity = '1';
        playAudio();
        setTimeout(() => {canvas.style.display = 'none'; text.style.display = 'none';}, 600);
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
            const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : DEFAULT_AVATAR;
            const img = new Image();
            img.src = avatarUrl;
            img.onload = () => {document.getElementById('discord-avatar').style.backgroundImage = `url('${avatarUrl}')`;};
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
        document.getElementById('discord-name').textContent = "Zeiren";
        spotifyIndicator.classList.remove('active');
        spotifyTooltip.classList.remove('has-track');
    } finally {
        if (!apiDone) {apiDone = true; checkAllReady();}
    }
}
function resizeCanvas() {canvas.width = window.innerWidth; canvas.height = window.innerHeight;}
window.addEventListener('resize', resizeCanvas);
if (audio.readyState >= 4) {audioDone = true;} else {
    audio.addEventListener('canplaythrough', () => {audioDone = true; checkAllReady();}, {once: true});
    setTimeout(() => {if (!audioDone) {audioDone = true; checkAllReady();}}, 5000);
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {domDone = true; checkAllReady();} else {
    document.addEventListener('DOMContentLoaded', () => {domDone = true; checkAllReady();});
}
resizeCanvas();
fetchDiscordData();
setInterval(fetchDiscordData, 6000);

const cursorCanvas = document.createElement('canvas');
cursorCanvas.id = 'cursor-particles';
cursorCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9997;';
document.body.appendChild(cursorCanvas);
const ctx = cursorCanvas.getContext('2d');
function resizeCursorCanvas() {cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;}
window.addEventListener('resize', resizeCursorCanvas);
resizeCursorCanvas();
const particles = [];
let mouseX = -100, mouseY = -100;

if (window.matchMedia("(pointer: coarse)").matches) {
    cursorCanvas.style.display = 'none';
} else {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        for (let i = 0; i < 2; i++) {
            particles.push({x: mouseX + (Math.random() * 10 - 5), y: mouseY + (Math.random() * 10 - 5), size: Math.random() * 2.5 + 1, speedY: Math.random() * 1.5 + 0.5, speedX: (Math.random() - 0.5) * 0.8, alpha: 1, life: Math.random() * 30 + 30});
        }
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (mouseX > 0 && mouseY > 0 && !window.matchMedia("(pointer: coarse)").matches) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= 0.02;
        p.life--;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0 || p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

const gridOverlay = document.createElement('div');
gridOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:1;background-image:linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);background-size:30px 30px;';
document.body.appendChild(gridOverlay);
