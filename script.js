// --- Configuration ---
const CORRECT_PASSWORD = '11102025';
const STATIC_TEXT = [
    "Welcome to Private Message.",
    "Sebelumnya maaf atas kejadian waktu itu. bila mengganggu yang sangat annoying, mybe. uhmm... yep jujur itu cuma niat baik aja sih. hanya saja waktu itu sebenarnya ngajak anak\" jajan yang mereka pengen, anak-anak lucu emg",
    "oh iya waktu itu juga for u too, is it good?. Ty yaa ✌︎︎•ᴗ•",
    "Thank you telah menerima dan meluangkan waktu untuk membaca Private Message ini. ",
];
const REPEAT_TEXT = "click reply for me ➤";
const REPEAT_LINK_URL = "https://wa.me/6285600447763"; 

const TYPING_SPEED = 50;
const DELETE_SPEED = 20;
const REPEAT_PAUSE = 3000; // 3s
const REPEAT_DELAY = 200; // 2s

// --- DOM Element References ---
const passwordGate = document.getElementById('password-gate');
const passwordInput = document.getElementById('password-input');
const submitButton = document.getElementById('submit-password');
const notification = document.getElementById('notification');
const togglePasswordButton = document.getElementById('toggle-password');
const textContainer = document.getElementById('text-container');
const typedTextSpan = document.getElementById('typed-text');
const soundcloudPlayer = document.getElementById('soundcloud-player'); 

let repeatLoopRunning = false;

// --- Show/Hide Password ---
if (togglePasswordButton && passwordInput) {
    togglePasswordButton.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        const icon = togglePasswordButton.querySelector('ion-icon');
        if (icon) {
            icon.setAttribute('name', isPassword ? 'eye-off' : 'eye');
        }
    });
}

// --- Typing Animation Function with repeating section ---
function startTypingAnimation(staticText, repeatText, repeatLinkUrl) {
    if (!textContainer || !typedTextSpan || !passwordGate) return;

    textContainer.style.display = 'flex';
    passwordGate.style.display = 'none';
    typedTextSpan.textContent = ''; // clearText
    typedTextSpan.classList.remove('finished'); // visibleCursor
    repeatLoopRunning = false;

    let staticIndex = 0;
    let staticTextIndex = 0;

    function typeStatic() {
        if (!repeatLoopRunning && staticTextIndex < staticText.length) {
            const currentText = staticText[staticTextIndex];
            if (staticIndex < currentText.length) {
                typedTextSpan.textContent += currentText.charAt(staticIndex);
                staticIndex++;
                setTimeout(() => typeStatic(), TYPING_SPEED);
            } else {
                staticIndex = 0;
                staticTextIndex++;
                if (staticTextIndex < staticText.length) {
                    setTimeout(() => {
                        eraseStatic(() => typeStatic());
                    }, REPEAT_PAUSE);
                } else {
                    if (!repeatLoopRunning) {
                        repeatLoopRunning = true;
                        eraseStatic(() => startRepeatLoop(repeatText, repeatLinkUrl));
                    }
                }
            }
        }
    }

    function eraseStatic(callback) {
        if (typedTextSpan.textContent.length > 0) {
            typedTextSpan.textContent = typedTextSpan.textContent.slice(0, -1);
            setTimeout(() => eraseStatic(callback), DELETE_SPEED);
        } else {
            callback();
        }
    }

    // Loop that types and deletes the repeatText indefinitely
    function startRepeatLoop(text, url) {
        typedTextSpan.textContent = '';

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.textDecoration = 'none';
        link.style.cursor = 'pointer';
        link.style.color = 'inherit'; // keep color consistent with surrounding text
        link.textContent = '';
        typedTextSpan.appendChild(link); 

        let rIndex = 0;

        function typeForward() {
            typedTextSpan.classList.remove('finished'); 

            if (rIndex < text.length) {
                link.textContent += text.charAt(rIndex);
                rIndex++;
                setTimeout(typeForward, TYPING_SPEED);
            } else {
                typedTextSpan.classList.add('finished');
                setTimeout(eraseBackward, REPEAT_PAUSE);
            }
        }

        function eraseBackward() {
            typedTextSpan.classList.remove('finished');
            if (rIndex > 0) {
                link.textContent = link.textContent.slice(0, -1);
                rIndex--;
                setTimeout(eraseBackward, DELETE_SPEED);
            } else {
                setTimeout(typeForward, REPEAT_DELAY);
            }
        }

        typeForward();
    }

    typeStatic();
}

function startSoundcloudAutoplay() {
    if (soundcloudPlayer && typeof soundcloudPlayer.play === 'function') {
        soundcloudPlayer.play().catch(error => {
            console.error("Audio Playback failed (browser restriction likely):", error);
        });
    }
}


// --- Notification Handler ---
function showNotification(message, isError = false) {
    if (!notification) return;

    notification.textContent = message;
    notification.classList.remove('error', 'show');

    if (isError) {
        notification.classList.add('error');
    }

    // Use a small delay to trigger CSS transition for 'show'
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); //3 seconds
}

// --- Password Check and Submit Handler ---
if (submitButton && passwordInput) {
    submitButton.addEventListener('click', () => {
        const enteredPassword = passwordInput.value.trim();

        if (enteredPassword === CORRECT_PASSWORD) {
            startTypingAnimation(STATIC_TEXT, REPEAT_TEXT, REPEAT_LINK_URL);

            startSoundcloudAutoplay();

        } else {
            // Incorrect Password: hint
            const errorMessage = "Password incorrect. Hint is 'barCode'";
            showNotification(errorMessage, true);
            passwordInput.value = ''; // Clear the input
        }
    });

    // Allow hitting 'Enter' to submit the password
    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitButton.click();
        }
    });
}
