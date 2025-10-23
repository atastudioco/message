// --- Configuration ---
const CORRECT_PASSWORD = 'faris';
const STATIC_TEXT = [
    "Welcome to Private Message.", 
    "Sebelumnya ", 
    "Terima kasih telah mengunjungi halaman ini.", 
    "This text automatically resizes on smaller screens thanks to the mobile query, ensuring maximum readability. Thank u from me. "
];
const REPEAT_TEXT = "wa.me/6285600447763";
const TYPING_SPEED = 50; 
const DELETE_SPEED = 40; 
const REPEAT_PAUSE = 3000; // ms
const REPEAT_DELAY = 200; 

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
togglePasswordButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const icon = togglePasswordButton.querySelector('ion-icon');
    icon.setAttribute('name', isPassword ? 'eye-off' : 'eye');
});

// --- Typing Animation Function with repeating section ---
function startTypingAnimation(staticText, repeatText) {
    textContainer.style.display = 'flex';
    passwordGate.style.display = 'none';
    typedTextSpan.textContent = ''; // clearText
    typedTextSpan.classList.remove('finished'); // visibleCursor
    repeatLoopRunning = false;

    let staticIndex = 0;
    let staticTextIndex = 0;

    function typeStatic() {
        if (staticTextIndex < staticText.length) {
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
                        startRepeatLoop(repeatText);
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
    function startRepeatLoop(text) {
        const link = document.createElement('a');
        link.href = (text.startsWith('http://') || text.startsWith('https://')) ? text : 'https://' + text;
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
                
                setTimeout(eraseBackward, REPEAT_PAUSE); // Fully typed the repeat text; pause then start erasing
            }
        }

        function eraseBackward() {
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
    if (soundcloudPlayer) {
        soundcloudPlayer.play().catch(error => {
            console.error("Audio Playback failed:", error);
        });
    }
}


// --- Notification Handler ---
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.remove('error');
    notification.classList.remove('show');

    if (isError) {
        notification.classList.add('error');
    }

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); //3 seconds
}

// --- Password Check and Submit Handler ---
submitButton.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();

    if (enteredPassword === CORRECT_PASSWORD) {
        // Correct Password: Start the animation
        startTypingAnimation(STATIC_TEXT, REPEAT_TEXT);
        
        // Mulai pemutaran audio setelah konten diungkapkan
        startSoundcloudAutoplay(); 
        
    } else {
        // Incorrect Password: Show notification with hint
        const errorMessage = "Password incorrect. Hint is 'barCode'";
        showNotification(errorMessage, true);
        passwordInput.value = ''; // Clear the input
    }
});

// Allow hitting 'Enter' to submit the password
passwordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        submitButton.click();
    }
});