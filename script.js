// ==========================================
// 1. نظام الترجمة وتعدد اللغات (i18n)
// ==========================================
const translations = {
    ar: {
        app_title: "رثاء الطف",
        tab_audio: "قصائد",
        tab_poets: "شعراء",
        tab_publish: "نشر",
        tab_settings: "إعدادات",
        quote_title: "حكمة اليوم",
        account_name: "اسم الحساب",
        contact_dev: "مراسلة المطور",
        language: "اللغة",
        theme: "المظهر",
        version: "إصدار التطبيق",
        published_poems: "القصائد المنشورة",
        read_full: "عرض القصيدة كاملة ✨",
        by_poet: "الشاعر:",
        by_user: "نُشرت بواسطة:",
        pending_title: "القصائد بانتظار الموافقة",
        splash_1: "صَلِّ على نبيّكَ الأكرم",
        splash_2: "اللهم صلِّ على محمد وآل محمد",
        contest_title: "📜 قوانين المسابقة",
        contest_desc: "يتم اختيار الفائز أسبوعياً بأعلى نسبة إعجابات.\nتُعرض القصيدة الفائزة لمدة 3 أيام.\nيجب أن تليق القصائد برثاء أهل البيت (ع).",
        login_title: "تسجيل الدخول / حساب جديد",
        login_desc: "يجب تسجيل الدخول لنشر القصائد أو الإعجاب بها.",
        btn_login: "دخول",
        btn_register: "حساب جديد",
        btn_forgot: "نسيت كلمة المرور؟",
        publish_main_title: "انشر موهبتك",
        logout_text: "خروج",
        pub_btn: "نشر القصيدة",
        search_placeholder: "ابحث عن قصيدة أو رادود...",
        email_placeholder: "البريد الإلكتروني (Email)",
        pass_placeholder: "كلمة المرور (Password)",
        pub_name_ph: "اسم الشاعر (يظهر للقصيدة)",
        pub_title_ph: "اسم القصيدة",
        pub_poem_ph: "اكتب القصيدة كاملة هنا...",
        theme_dark: "داكن ملكي",
        theme_light: "أبيض"
    },
    en: {
        app_title: "Ritha Al-Taff",
        tab_audio: "Audio",
        tab_poets: "Poets",
        tab_publish: "Publish",
        tab_settings: "Settings",
        quote_title: "Quote of the Day",
        account_name: "Account Name",
        contact_dev: "Contact Developer",
        language: "Language",
        theme: "Theme",
        version: "App Version",
        published_poems: "Published Poems",
        read_full: "Read Full Poem ✨",
        by_poet: "Poet:",
        by_user: "Published by:",
        pending_title: "Poems Pending Approval",
        splash_1: "Blessings upon the Noble Prophet",
        splash_2: "O Allah, bless Muhammad and his Family",
        contest_title: "📜 Contest Rules",
        contest_desc: "Winner is chosen weekly based on likes.\nWinning poem is featured for 3 days.\nPoems must be respectful to Ahlulbayt (a.s).",
        login_title: "Login / Register",
        login_desc: "You must log in to publish or like poems.",
        btn_login: "Login",
        btn_register: "Register",
        btn_forgot: "Forgot Password?",
        publish_main_title: "Share Your Talent",
        logout_text: "Logout",
        pub_btn: "Publish Poem",
        search_placeholder: "Search for a poem or reciter...",
        email_placeholder: "Email Address",
        pass_placeholder: "Password",
        pub_name_ph: "Poet Name",
        pub_title_ph: "Poem Title",
        pub_poem_ph: "Write full poem here...",
        theme_dark: "Royal Dark",
        theme_light: "Light"
    }
};

let currentLang = localStorage.getItem('app_lang') || 'ar';

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    loadApprovedPoems(); 
}

// ==========================================
// 2. نظام المشغل الصوتي والبحث
// ==========================================
const globalAudio = new Audio();
let currentTrackId = null;
let isSwitchingTrack = false; 
let currentSeekBar = null;
let currentTimeDisplay = null;

globalAudio.addEventListener('timeupdate', function() {
    if (!currentTrackId || !currentSeekBar) return;
    
    if (globalAudio.duration) {
        const percent = (globalAudio.currentTime / globalAudio.duration) * 100;
        currentSeekBar.value = percent;
        currentSeekBar.style.setProperty('--progress', percent + '%'); 
        
        if(currentTimeDisplay) {
            currentTimeDisplay.innerText = `${formatTime(globalAudio.currentTime)} / ${formatTime(globalAudio.duration)}`;
        }
    }
});

globalAudio.addEventListener('ended', function() {
    if (!currentTrackId) return;
    playNext(currentTrackId);
});

function loadAudioList() {
    const audioContainer = document.getElementById('audio-list');
    if (!audioContainer) return;

    let htmlContent = ''; 

    if (typeof audioData !== 'undefined' && audioData.length > 0) {
        audioData.forEach(track => {
            const trackId = track.id; 
            const safeTitle = (track.title || '').toLowerCase();
            const safePoet = (track.poet || '').toLowerCase();
            const safeReciter = (track.reciter || '').toLowerCase();

            htmlContent += `
            <div id="card-${trackId}" class="premium-card audio-track-card" data-title="${safeTitle}" data-poet="${safePoet}" data-reciter="${safeReciter}">
                <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 class="gold-text" style="margin-bottom: 8px; font-size: 18px;">
                            <i class="fa-solid fa-play" style="font-size: 14px; margin-left: 5px; color: var(--ruby-purple);"></i> ${track.title}
                        </h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin: 0;">
                            <i class="fa-solid fa-microphone" style="color: var(--ruby-purple); margin-left: 3px;"></i> ${track.reciter}
                            <span style="color: var(--ruby-purple); margin: 0 8px;">|</span>
                            <i class="fa-solid fa-feather-pointed" style="color: var(--ruby-purple); margin-left: 3px;"></i> ${track.poet}
                        </p>
                    </div>
                </div>

                <div class="custom-audio-player">
                    <div class="player-main-row">
                        <div class="controls-group">
                            <button onclick="skipTime(-10)" class="skip-btn"><i class="fa-solid fa-backward-10"></i></button>
                            <button id="playBtn-${trackId}" class="play-pause-btn" onclick="togglePlay('${trackId}', '${track.file}')">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button onclick="skipTime(10)" class="skip-btn"><i class="fa-solid fa-forward-10"></i></button>
                        </div>
                        <div class="progress-container">
                            <input type="range" id="seek-${trackId}" value="0" max="100" onchange="seekAudio(this.value)" oninput="seekAudio(this.value)">
                            <div class="time-display" id="time-${trackId}">0:00 / 0:00</div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        audioContainer.innerHTML = htmlContent;
    } else {
        audioContainer.innerHTML = '<p class="amiri-text" style="text-align: center; color: var(--text-muted); padding: 20px;">سيتم إضافة القصائد الصوتية قريباً...</p>';
    }
}

function searchAudio() {
    const query = (document.getElementById('search-audio-input')?.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.audio-track-card');
    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const poet = card.getAttribute('data-poet') || '';
        const reciter = card.getAttribute('data-reciter') || '';
        if (title.includes(query) || poet.includes(query) || reciter.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function togglePlay(id, fileSrc) {
    if (isSwitchingTrack) return; 

    if (currentTrackId === id) {
        const playBtn = document.getElementById(`playBtn-${id}`);
        if (globalAudio.paused) {
            globalAudio.play();
            if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            globalAudio.pause();
            if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        return;
    }

    isSwitchingTrack = true;

    if (currentTrackId) {
        globalAudio.pause();
        const oldBtn = document.getElementById(`playBtn-${currentTrackId}`);
        if(oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if(currentSeekBar) { currentSeekBar.value = 0; currentSeekBar.style.setProperty('--progress', '0%'); }
        if(currentTimeDisplay) currentTimeDisplay.innerText = '0:00 / 0:00';
    }

    const newBtn = document.getElementById(`playBtn-${id}`);
    if (newBtn) newBtn.innerHTML = '<i class="fa-solid fa-hourglass-half fa-spin"></i>';

    currentTrackId = id;
    globalAudio.src = fileSrc;
    globalAudio.load();
    
    currentSeekBar = document.getElementById(`seek-${id}`);
    currentTimeDisplay = document.getElementById(`time-${id}`);

    globalAudio.play().then(() => {
        if (newBtn) newBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        isSwitchingTrack = false; 
        if (currentTimeDisplay && globalAudio.duration) {
            currentTimeDisplay.innerText = `0:00 / ${formatTime(globalAudio.duration)}`;
        }
    }).catch(err => {
        console.error("Audio playback failed:", err);
        if (newBtn) newBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        isSwitchingTrack = false;
    });
}

function seekAudio(percent) {
    if (globalAudio.duration && currentTrackId) {
        globalAudio.currentTime = (percent / 100) * globalAudio.duration;
    }
}

function skipTime(seconds) {
    if (globalAudio.duration && currentTrackId) {
        globalAudio.currentTime += seconds;
    }
}

function playNext(currentId) {
    if (typeof audioData === 'undefined') return;
    const currentIndex = audioData.findIndex(t => t.id == currentId);
    if (currentIndex !== -1 && currentIndex < audioData.length - 1) {
        const nextTrack = audioData[currentIndex + 1];
        togglePlay(nextTrack.id, nextTrack.file);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================
// 3. الحكم والمظهر
// ==========================================
const dailyQuotes = [
    "من راقب الناس مات هماً، ومن راقب الحسين عاش حراً", "الحسين ليس شخصاً، بل هو مشروع إنساني متكامل",
    "إن كان دين محمد لم يستقم إلا بقتلي، يا سيوف خذيني", "هيهات منا الذلة", "كل يوم عاشوراء وكل أرض كربلاء",
    "البكاء على الحسين رسالة ثورة", "تعلمت من الحسين كيف أكون مظلوماً فأنتصر", "العباس قمر العشيرة ورمز الوفاء"
];

function setDailyQuote() {
    const startDate = new Date('2024-01-01T00:00:00');
    const today = new Date();
    const diffDays = Math.floor(Math.abs(today - startDate) / (1000 * 60 * 60 * 24));
    const qElem = document.getElementById('quote-text');
    if(qElem) qElem.innerText = dailyQuotes[diffDays % dailyQuotes.length];
}

function changeTheme() {
    const themeSelect = document.getElementById('theme-select');
    if(themeSelect) {
        document.documentElement.setAttribute('data-theme', themeSelect.value);
    }
}

// ==========================================
// 4. إدارة حسابات المستخدمين و Firebase Auth (أونلاين دائماً)
// ==========================================
var isFirebaseReady = false;
var currentUser = null; 
var currentUsername = null; 
window.allApprovedPoems = [];


function initFirebaseApp() {
    try {
        var firebaseConfig = {
            apiKey: "AIzaSyB5RE7ZW1xWH_dQPoO0xigEKWj17QUQJAE",
            authDomain: "ritha-taff-new-a1682.firebaseapp.com",
            databaseURL: "https://ritha-taff-new-a1682-default-rtdb.firebaseio.com",
            projectId: "ritha-taff-new-a1682",
            storageBucket: "ritha-taff-new-a1682.firebasestorage.app",
            messagingSenderId: "132600875170",
            appId: "1:132600875170:web:05a584d2e2b9d4a5322ffb"
        };

        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        isFirebaseReady = true;
        setupFirebaseAuth();
    } catch (error) {
        console.error("Firebase Auth Fail:", error);
    }
}

function setupFirebaseAuth() {
    firebase.auth().onAuthStateChanged(function(user) {
        var displayUsername = document.getElementById('display-username');
        var loginCard = document.getElementById('login-container');
        var usernameCard = document.getElementById('username-container');
        var publishCard = document.getElementById('publish-container');

        if (user) {
            currentUser = user;
            firebase.database().ref('users/' + user.uid + '/username').once('value').then(function(snapshot) {
                if (snapshot.exists()) {
                    currentUsername = snapshot.val();
                    if(displayUsername) displayUsername.innerText = currentUsername;
                    if (loginCard) loginCard.style.display = 'none';
                    if (usernameCard) usernameCard.style.display = 'none';
                    if (publishCard) publishCard.style.display = 'block';
                } else {
                    currentUsername = user.email ? user.email.split('@')[0] : "مستخدم";
                    if (loginCard) loginCard.style.display = 'none';
                    if (usernameCard) usernameCard.style.display = 'block';
                    if (publishCard) publishCard.style.display = 'none';
                }
            }).catch(function() {
                currentUsername = user.email ? user.email.split('@')[0] : "مستخدم";
                if(displayUsername) displayUsername.innerText = currentUsername;
                if (loginCard) loginCard.style.display = 'none';
                if (publishCard) publishCard.style.display = 'block';
            });

        } else {
            currentUser = null;
            currentUsername = null;
            if(displayUsername) displayUsername.innerText = "غير مسجل";

            if (loginCard) loginCard.style.display = 'block';
            if (usernameCard) usernameCard.style.display = 'none';
            if (publishCard) publishCard.style.display = 'none';
        }
        loadApprovedPoems();
        loadPendingPoems(); 
    });
}

function loginUser() {
    if (!isFirebaseReady) return alert("انتظر اتصال قاعدة البيانات.");
    
    var emailInput = document.getElementById('auth-email');
    var passInput = document.getElementById('auth-pass');
    
    if (!emailInput || !passInput || !emailInput.value.trim() || !passInput.value) {
        alert("يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح!");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(emailInput.value.trim(), passInput.value)
        .then(function() {
            alert("تم تسجيل الدخول بنجاح!");
        })
        .catch(function(error) {
            alert("خطأ في تسجيل الدخول: " + error.message);
        });
}

function registerUser() {
    if (!isFirebaseReady) return alert("انتظر اتصال قاعدة البيانات.");

    var emailInput = document.getElementById('auth-email');
    var passInput = document.getElementById('auth-pass');

    if (!emailInput || !passInput || !emailInput.value.trim() || !passInput.value) {
        alert("يرجى إدخال البريد الإلكتروني وكلمة المرور لإنشاء الحساب!");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(emailInput.value.trim(), passInput.value)
        .then(function(result) {
            var uid = result.user.uid;
            var defaultName = emailInput.value.split('@')[0];
            firebase.database().ref('users/' + uid).set({
                username: defaultName,
                email: emailInput.value
            }).then(function() {
                alert("تم إنشاء الحساب بنجاح!");
            });
        })
        .catch(function(error) {
            alert("فشل إنشاء الحساب: " + error.message);
        });
}

function saveUsername() {
    if (!currentUser || !isFirebaseReady) return alert("يجب تسجيل الدخول أولاً!");
    var usernameInput = document.getElementById('choose-username-input');
    var val = usernameInput ? usernameInput.value.trim() : "";

    if (!val) return alert("يرجى كتابة اسم الحساب!");

    firebase.database().ref('users/' + currentUser.uid).update({
        username: val
    }).then(function() {
        currentUsername = val;
        var displayUsername = document.getElementById('display-username');
        if (displayUsername) displayUsername.innerText = currentUsername;

        document.getElementById('username-container').style.display = 'none';
        document.getElementById('publish-container').style.display = 'block';
        alert("تم حفظ الاسم بنجاح!");
    }).catch(function(err) {
        alert("خطأ أثناء حفظ الاسم: " + err.message);
    });
}

function resetPassword() {
    if (!isFirebaseReady) return alert("انتظر اتصال قاعدة البيانات.");

    var emailInput = document.getElementById('auth-email');

    if (!emailInput || !emailInput.value.trim()) {
        alert("اكتب البريد الإلكتروني أولاً في الحقل أعلاه ليرسل لك التطبيق رابط تعيين كلمة المرور!");
        return;
    }

    firebase.auth().sendPasswordResetEmail(emailInput.value.trim())
        .then(function() {
            alert("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!");
        })
        .catch(function(error) {
            alert("فشل إرسال الرابط: " + error.message);
        });
}

function logoutUser() {
    if (!isFirebaseReady) return;
    firebase.auth().signOut().then(function() {
        alert("تم تسجيل الخروج.");
    });
}

// ==========================================
// 5. عرض القصائد والمسابقة (تصغير، توسيط، كتابة بيضاء وكبيرة)
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// دالة تحديد الفائز وعرضه بشكل مصغر، في المنتصف، وبكتابة بيضاء كبيرة
function updateContestBoard(poemsArray) {
    var contestBoard = document.getElementById('weekly-contest-board');
    if (!contestBoard) return;

    // تصغير قائمة فائز الأسبوع وتوسيطها عبر الـ CSS المضمّن
    contestBoard.style.maxWidth = "88%";
    contestBoard.style.margin = "10px auto 15px auto";
    contestBoard.style.padding = "12px 15px";

    var today = new Date().getDay(); 
    // الأحد (0)، الإثنين (1)، الثلاثاء (2) -> عرض الفائز
    var isWinnerDays = (today >= 0 && today <= 2);

    if (!isWinnerDays) {
        contestBoard.innerHTML = `
            <div style="text-align: center;">
                <h3 class="gold-text" style="margin-bottom: 8px; font-size: 17px;"><i class="fa-solid fa-scroll"></i> المنافسة الأسبوعية مستمرة!</h3>
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; font-weight: bold; margin: 0 auto; max-width: 95%;">
                    مرحلة جمع الإعجابات للقصائد مفتوحة الآن (من الأربعاء إلى السبت).<br>
                    سيتم إعلان الفائز تلقائياً بأعلى نسبة إعجابات أيام: الأحد، الإثنين، والثلاثاء.<br>
                    <span style="color: var(--gold); display: block; margin-top: 6px; font-size: 13px;">(ملاحظة: النشر متاح طوال أيام الأسبوع)</span>
                </p>
            </div>
        `;
        return;
    }

    if (!poemsArray || poemsArray.length === 0) {
        contestBoard.innerHTML = '<h3 class="gold-text" style="text-align: center; font-size: 16px;">لا يوجد قصائد فائزة حتى الآن</h3>';
        return;
    }
    
    var winner = poemsArray.reduce(function(prev, current) {
        return ((current.likes || 0) > (prev.likes || 0)) ? current : prev;
    }, poemsArray[0]);

    if (!winner || (winner.likes || 0) === 0) {
        contestBoard.innerHTML = '<h3 class="gold-text" style="text-align: center; font-size: 16px;">لم تحصل أي قصيدة على إعجابات بعد</h3>';
        return;
    }

    var userWinsCount = poemsArray.filter(p => p.uploaderUsername === winner.uploaderUsername && (p.likes || 0) > 0).length;
    var winBadgeHTML = '';
    
    if (userWinsCount > 1) {
        winBadgeHTML = `
            <div style="text-align: center; margin-top: 8px;">
                <span style="background: var(--ruby-purple); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid var(--gold);">
                    <i class="fa-solid fa-medal"></i> هذا الشخص فاز بـ ${userWinsCount} مسابقات
                </span>
            </div>
        `;
    }

    const t = translations[currentLang];
    var firstLine = (winner.text || '').trim().split('\n')[0] || '';
    var isLikedByMe = currentUser && winner.likedBy && winner.likedBy[currentUser.uid] ? true : false;
    var heartIcon = isLikedByMe ? '❤️' : '🤍';

    contestBoard.innerHTML = `
        <div style="text-align: center; border-bottom: 1px solid var(--gold); padding-bottom: 6px; margin-bottom: 8px;">
            <h3 class="gold-text" style="margin:0; font-size: 17px;"><i class="fa-solid fa-trophy"></i> 🏆 فائز الأسبوع</h3>
        </div>
        
        <div class="premium-card poem-preview-card" style="border: 1px solid var(--gold); margin-bottom: 0; text-align: center;" onclick="openPoemModal('${winner.id}')">
            <div class="poem-card-header" style="text-align: center;">
                <h3 class="gold-text" style="font-size: 18px;">${winner.title}</h3>
                <p class="poem-poet-name" style="color: #ffffff; font-size: 14px;"><i class="fa-solid fa-feather-pointed"></i> ${t.by_poet} ${winner.poet}</p>
                <p class="poem-uploader-name" style="color: #cccccc; font-size: 12px;"><i class="fa-solid fa-user"></i> ${t.by_user} @${winner.uploaderUsername || 'مجهول'}</p>
            </div>
            
            <div class="poem-first-line-box" style="text-align: center;">
                <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0;">${firstLine}...</p>
            </div>

            <div class="poem-card-footer" style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                <span class="read-more-btn" style="font-size: 13px;">${t.read_full} <i class="fa-solid fa-arrow-left"></i></span>
                <button class="like-btn-inline" onclick="event.stopPropagation(); toggleLike('${winner.id}')" style="font-size: 16px;">
                    ${heartIcon} <span class="gold-text">${winner.likes || 0}</span>
                </button>
            </div>
        </div>
        ${winBadgeHTML}
    `;
}

function loadApprovedPoems() {
    if (!isFirebaseReady) return;

    firebase.database().ref('approved_poems').on('value', function(snapshot) {
        var list = document.getElementById('community-poems-list');
        if (!list) return;
        list.innerHTML = ''; 

        if (!snapshot.exists()) {
            list.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد قصائد منشورة حالياً!</p>`;
            return;
        }

        var poemsArray = [];
        snapshot.forEach(function(child) {
            var item = child.val();
            item.id = child.key;
            poemsArray.push(item);
        });
        
        poemsArray = shuffleArray(poemsArray);
        window.allApprovedPoems = poemsArray; 
        
        updateContestBoard(poemsArray);

        const t = translations[currentLang];

        poemsArray.forEach(function(data) {
            var isLikedByMe = currentUser && data.likedBy && data.likedBy[currentUser.uid] ? true : false;
            var heartIcon = isLikedByMe ? '❤️' : '🤍';
            
            var textLines = (data.text || '').trim().split('\n');
            var firstLine = textLines[0] || '';

            list.innerHTML += `
            <div class="premium-card poem-preview-card" onclick="openPoemModal('${data.id}')">
                <div class="poem-card-header">
                    <h3 class="gold-text">${data.title}</h3>
                    <p class="poem-poet-name"><i class="fa-solid fa-feather-pointed"></i> ${t.by_poet} ${data.poet}</p>
                    <p class="poem-uploader-name"><i class="fa-solid fa-user"></i> ${t.by_user} @${data.uploaderUsername || 'مجهول'}</p>
                </div>
                
                <div class="poem-first-line-box">
                    <p class="amiri-text">${firstLine}...</p>
                </div>

                <div class="poem-card-footer">
                    <span class="read-more-btn">${t.read_full} <i class="fa-solid fa-arrow-left"></i></span>
                    <button class="like-btn-inline" onclick="event.stopPropagation(); toggleLike('${data.id}')">
                        ${heartIcon} <span class="gold-text">${data.likes || 0}</span>
                    </button>
                </div>
            </div>`;
        });
    });
}

function openPoemModal(poemId) {
    const poem = (window.allApprovedPoems || []).find(p => p.id === poemId);
    if (!poem) return;

    let modal = document.getElementById('lux-poem-modal');
    if (!modal) {
        const modalHTML = `
        <div id="lux-poem-modal" class="lux-modal-overlay" onclick="closePoemModal()">
            <div class="lux-modal-content" onclick="event.stopPropagation()">
                <button class="lux-close-btn" onclick="closePoemModal()">&times;</button>
                <div class="lux-modal-header">
                    <h2 id="modal-poem-title" class="gold-text"></h2>
                    <p id="modal-poem-poet" style="color: var(--ruby-purple); font-size: 14px; margin-top: 5px;"></p>
                    <p id="modal-poem-uploader" style="color: var(--text-muted); font-size: 12px;"></p>
                </div>
                <div class="lux-divider"></div>
                <div class="lux-modal-body">
                    <p id="modal-poem-text" class="amiri-text" style="white-space: pre-wrap; line-height: 2; font-size: 17px; text-align: center; color: var(--text-main);"></p>
                </div>
                <div class="lux-modal-footer">
                    <button id="modal-like-btn" class="lux-like-action"></button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('lux-poem-modal');
    }

    const t = translations[currentLang];
    document.getElementById('modal-poem-title').innerText = poem.title;
    document.getElementById('modal-poem-poet').innerText = `${t.by_poet} ${poem.poet}`;
    document.getElementById('modal-poem-uploader').innerText = `${t.by_user} @${poem.uploaderUsername || 'مجهول'}`;
    document.getElementById('modal-poem-text').innerText = poem.text;
    
    const isLikedByMe = currentUser && poem.likedBy && poem.likedBy[currentUser.uid] ? true : false;
    const heartIcon = isLikedByMe ? '❤️' : '🤍';
    const likeBtn = document.getElementById('modal-like-btn');
    
    likeBtn.innerHTML = `${heartIcon} <span class="gold-text" style="font-size: 16px;">${poem.likes || 0}</span>`;
    likeBtn.onclick = function() {
        toggleLike(poem.id);
        setTimeout(() => openPoemModal(poem.id), 200);
    };

    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden'; 
}

function closePoemModal() {
    const modal = document.getElementById('lux-poem-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function toggleLike(poemId) {
    if (!isFirebaseReady || !currentUser) return alert("يجب تسجيل الدخول للإعجاب بالقصائد!");
    var uid = currentUser.uid;
    var poemRef = firebase.database().ref('approved_poems/' + poemId);
    var userLikeRef = poemRef.child('likedBy/' + uid);

    userLikeRef.once('value').then(function(snap) {
        poemRef.child('likes').once('value').then(function(lSnap) {
            var likes = lSnap.val() || 0;
            if (snap.exists()) { 
                userLikeRef.remove(); 
                poemRef.child('likes').set(likes - 1); 
            } else { 
                userLikeRef.set(true); 
                poemRef.child('likes').set(likes + 1); 
            }
        });
    });
}

// ==========================================
// 6. النشر والموافقة
// ==========================================
function submitPoem() {
    if (!isFirebaseReady) {
        return alert("لم يتم الاتصال بقاعدة البيانات بعد.");
    }
    
    if (!currentUser) {
        return alert("سجل دخولك أولاً لكي تتمكن من النشر!");
    }

    var nameInput = document.getElementById('pub-name');
    var titleInput = document.getElementById('pub-title');
    var poemInput = document.getElementById('pub-poem');

    if (!nameInput || !titleInput || !poemInput) {
        return alert("خطأ: الحقول غير موجودة في الواجهة.");
    }

    var name = nameInput.value.trim();
    var title = titleInput.value.trim();
    var text = poemInput.value.trim();

    if (name === '' || title === '' || text === '') {
        return alert("يرجى ملء جميع الحقول!");
    }

    var uploaderName = currentUsername || (currentUser.email ? currentUser.email.split('@')[0] : "مستخدم");

    var btn = document.getElementById('pub-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "جاري الإرسال...";
    }

    firebase.database().ref('pending_poems').push({
        poet: name,
        title: title,
        text: text,
        uploaderUsername: uploaderName,
        uid: currentUser.uid,
        likes: 0,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
        alert("تم إرسال قصيدتك بنجاح! هي الآن قيد المراجعة وبانتظار الموافقة.");
        nameInput.value = '';
        titleInput.value = '';
        poemInput.value = '';
    }).catch(function(error) {
        console.error("Publish Error:", error);
        alert("فشل إرسال القصيدة:\n" + error.message);
    }).finally(function() {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "نشر القصيدة";
        }
    });
}

function loadPendingPoems() {
    if (!isFirebaseReady) return;
    var adminContainer = document.getElementById('admin-pending-list');
    if (!adminContainer) return; 

    firebase.database().ref('pending_poems').on('value', function(snapshot) {
        adminContainer.innerHTML = '';
        if (!snapshot.exists()) {
            adminContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">لا توجد قصائد بانتظار الموافقة.</p>';
            return;
        }

        snapshot.forEach(function(child) {
            var data = child.val();
            var id = child.key;

            adminContainer.innerHTML += `
            <div class="premium-card" style="padding: 15px; margin-bottom: 15px; border: 1px solid gold;">
                <h4 class="gold-text">${data.title}</h4>
                <p style="font-size: 12px; color: var(--ruby-purple);">الشاعر: ${data.poet} | بواسطة: @${data.uploaderUsername}</p>
                <p style="white-space: pre-wrap; font-size: 13px;">${data.text}</p>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="approvePoem('${id}')" style="background: green; color: white; border: none; padding: 6px 15px; border-radius: 5px; cursor: pointer;">موافقة ونشر</button>
                    <button onclick="rejectPoem('${id}')" style="background: red; color: white; border: none; padding: 6px 15px; border-radius: 5px; cursor: pointer;">رفض وحذف</button>
                </div>
            </div>`;
        });
    });
}

function approvePoem(poemId) {
    if (!isFirebaseReady || !currentUser) return;
    var pendingRef = firebase.database().ref('pending_poems/' + poemId);
    pendingRef.once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            var poemData = snapshot.val();
            firebase.database().ref('approved_poems').push(poemData).then(function() {
                pendingRef.remove();
                alert("تمت الموافقة والنشر بنجاح!");
            });
        }
    });
}

function rejectPoem(poemId) {
    if (!isFirebaseReady || !currentUser) return;
    if (confirm("هل تريد حذف هذه القصيدة المعلقة نهائياً؟")) {
        firebase.database().ref('pending_poems/' + poemId).remove().then(function() {
            alert("تم حذف القصيدة.");
        });
    }
}

// ==========================================
// 7. التنقل والتشغيل عند البداية
// ==========================================
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('section-' + tabId).classList.add('active');
    btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.classList.add('splash-hidden');
            setTimeout(() => splashScreen.remove(), 800);
        }
    }, 2500);

    changeLanguage(currentLang);
    initFirebaseApp(); // تهيئة الفايربيس مباشرة بدون التحقق من الأوفلاين
    loadAudioList(); 
    setDailyQuote(); 

    const langSelect = document.getElementById('language-select');
    if(langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
    }
});
