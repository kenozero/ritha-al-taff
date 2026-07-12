// ==========================================
// 1. نظام المشغل الصوتي الموحد والتشغيل التسلسلي التلقائي
// ==========================================
let globalAudio = new Audio();
let currentTrackId = null;

// تحديث الوقت والشريط للقصيدة الشغالة فقط
globalAudio.addEventListener('timeupdate', function() {
    if (!currentTrackId) return;
    const seekBar = document.getElementById(`seek-${currentTrackId}`);
    const timeDisplay = document.getElementById(`time-${currentTrackId}`);
    if (globalAudio.duration) {
        const percent = (globalAudio.currentTime / globalAudio.duration) * 100;
        seekBar.value = percent;
        seekBar.style.setProperty('--progress', percent + '%');
        timeDisplay.innerText = `${formatTime(globalAudio.currentTime)} / ${formatTime(globalAudio.duration)}`;
    }
});

// جلب وعرض الوقت الكلي فقط بعد الضغط على تشغيل
globalAudio.addEventListener('loadedmetadata', function() {
    if (!currentTrackId) return;
    const timeDisplay = document.getElementById(`time-${currentTrackId}`);
    timeDisplay.innerText = `0:00 / ${formatTime(globalAudio.duration)}`;
});

// الحدث عند انتهاء القصيدة: تصفير الحالية وتشغيل القصيدة التي تليها تلقائياً
globalAudio.addEventListener('ended', function() {
    if (!currentTrackId) return;
    
    // 1. إيقاف وتصفير واجهة القصيدة الحالية
    document.getElementById(`playBtn-${currentTrackId}`).innerHTML = '<i class="fa-solid fa-play"></i>';
    const seekBar = document.getElementById(`seek-${currentTrackId}`);
    if (seekBar) { seekBar.value = 0; seekBar.style.setProperty('--progress', '0%'); }
    
    // 2. جلب القصيدة التالية من مصفوفة البيانات audioData
    const currentIndex = audioData.findIndex(track => track.id == currentTrackId);
    
    if (currentIndex !== -1 && currentIndex < audioData.length - 1) {
        const nextTrack = audioData[currentIndex + 1];
        
        // 3. تشغيل القصيدة التالية تلقائياً
        togglePlay(nextTrack.id, nextTrack.file);
        
        // 4. تمرير الشاشة تلقائياً للقصيدة الجديدة
        const nextCard = document.getElementById(`card-${nextTrack.id}`);
        if (nextCard) {
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        currentTrackId = null; // الوصول لنهاية القائمة
    }
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
                            <div class="time-display" id="time-${trackId}">--:-- / --:--</div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        });
        audioContainer.innerHTML = htmlContent;
    } else {
        audioContainer.innerHTML = '<p class="amiri-text" style="text-align: center; color: var(--text-muted); padding: 20px;">سيتم إضافة القصائد الصوتية قريباً...</p>';
    }
}

function searchAudio() {
    const input = document.getElementById('search-audio-input').value.toLowerCase();
    const cards = document.querySelectorAll('.audio-track-card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const poet = card.getAttribute('data-poet') || '';
        const reciter = card.getAttribute('data-reciter') || '';

        if (title.includes(input) || poet.includes(input) || reciter.includes(input)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function togglePlay(id, fileSrc) {
    if (currentTrackId === id) {
        if (globalAudio.paused) {
            globalAudio.play();
            document.getElementById(`playBtn-${id}`).innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            globalAudio.pause();
            document.getElementById(`playBtn-${id}`).innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    } else {
        if (currentTrackId) {
            const oldBtn = document.getElementById(`playBtn-${currentTrackId}`);
            if (oldBtn) oldBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            const oldSeek = document.getElementById(`seek-${currentTrackId}`);
            if (oldSeek) { oldSeek.value = 0; oldSeek.style.setProperty('--progress', '0%'); }
            const oldTime = document.getElementById(`time-${currentTrackId}`);
            if (oldTime) oldTime.innerText = '--:-- / --:--';
        }
        
        currentTrackId = id;
        globalAudio.src = fileSrc;
        globalAudio.play();
        const newBtn = document.getElementById(`playBtn-${id}`);
        if (newBtn) newBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}

function seekAudio(percent) {
    if (globalAudio.duration) {
        globalAudio.currentTime = (percent / 100) * globalAudio.duration;
    }
}

function skipTime(seconds) {
    if (globalAudio.duration) {
        globalAudio.currentTime += seconds;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================
// 3. حكمة اليوم التلقائية (100 حكمة)
// ==========================================
const dailyQuotes = [
    "من راقب الناس مات هماً، ومن راقب الحسين عاش حراً", "الحسين ليس شخصاً، بل هو مشروع إنساني متكامل",
    "إن كان دين محمد لم يستقم إلا بقتلي، يا سيوف خذيني", "هيهات منا الذلة", "كل يوم عاشوراء وكل أرض كربلاء",
    "البكاء على الحسين رسالة ثورة", "تعلمت من الحسين كيف أكون مظلوماً فأنتصر", "العباس قمر العشيرة ورمز الوفاء",
    "زينب جبل الصبر في مواجهة الطغيان", "إنما خرجت لطلب الإصلاح في أمة جدي", "من هوان الدنيا على الله أن يهدى رأس يحيى لِبغيّ",
    "لا أرى الموت إلا سعادة والحياة مع الظالمين إلا برما", "يا ليتنا كنا معكم فنفوز فوزاً عظيماً", "كذب الموت فالحسين مخلد",
    "العباس كفيل الخدر وحامي العقيلة", "يا كربلاء خذيني لترابك", "الدم ينتصر على السيف دائماً", "الحسين سفينة النجاة",
    "مصباح الهدى وسفينة النجاة هو الحسين", "عش عزيزاً أو مت وأنت كريم", "لا يوم كيومك يا أبا عبد الله",
    "زينب بصبرها أكملت رسالة عاشوراء", "السلام على الشيب الخضيب", "السلام على الخد التريب", "يا ساقي عطاشى كربلاء",
    "أبد والله يا زهراء ما ننسى حسيناه", "الحسين دمعة جارية في كل عين مؤمن", "قتيل العبرات وأسير الكربات",
    "الشهادة شرف الأحرار", "طف كربلاء مدرسة الأجيال", "أعطني يقيناً كيقين العباس", "الحسين علمنا أن الموت في عز حياة",
    "صوت زينب هدم عروش الطغاة", "كربلاء ليست جغرافيا بل عقيدة", "دم الحسين شجرة تثمر الأحرار", "الولاء للحسين ولاء للحق",
    "طريق الحسين هو طريق الجنة", "الحر الرياحي نال شرف التوبة الحسينية", "القاسم عريس كربلاء", "علي الأكبر شبيه المصطفى",
    "عبد الله الرضيع أصغر جندي في كربلاء", "سهم المثلث مزق قلب الإنسانية", "رقية يتيمة الحسين وصرخة الشام",
    "يا حسين يا سيد الشهداء", "أنا قتيل العبرة لا يذكرني مؤمن إلا بكى", "نحن عشاق الشهادة", "شيعتي مهما شربتم عذب ماء فاذكروني",
    "أو سمعتم بغريب أو شهيد فاندبوني", "الوفاء خُلق العباس بن علي", "الأخوة تتجسد في أبي الفضل", "الحسين ثورة لا تنطفئ",
    "نور الحسين يضيء دروب الظلام", "من أحبنا أهل البيت فليستعد للبلاء", "اللهم ارزقنا شفاعة الحسين يوم الورود",
    "ثورة الحسين ضد الظلم مستمرة", "زينب كعبة الأحزان", "لا عذب الله أمي إنها شربت حب الوصي", "تربة كربلاء شفاء من كل داء",
    "عاشوراء صرخة الحق في وجه الباطل", "الحسين قران ناطق", "من كربلاء نستمد العزم", "صبر الحسين أعجز الملائكة",
    "الحسين ضحى بالغالي والنفيس لأجل الدين", "السلام على الرأس المرفوع فوق القنا", "السلام على الشفاه الذابلات",
    "السلام على الأجساد العاريات", "يا لثارات الحسين", "بدمائكم انتصر الإسلام", "يا ليتني كنت درعاً للحسين",
    "الوفاء للعباس دين في أعناقنا", "الأيتام يبكونك يا حسين", "زينب راية لا تنكسر", "الحسين رمز الفداء", "الأحرار يبكون الحسين",
    "مأجورين يا شيعة علي", "كربلاء قبلة العشاق", "يا غريب طوس يا أنيس النفوس يابن الحسين", "لن تمحو ذكرنا",
    "زينب صرخة في وجه يزيد", "الحسين حي في قلوبنا", "الدمعة على الحسين تغسل الذنوب", "يا موضع سر الله", "يا رحمة الله الواسعة",
    "الحسين قبلة الأحرار", "من سل سيف البغي قُتل به", "الحسين حجة الله على خلقه", "الإيمان يتجلى في كربلاء", "السلام على الحسين وعلى علي بن الحسين",
    "وعلى أولاد الحسين وعلى أصحاب الحسين", "يا كفيل الزينبات", "العباس عين الحسين الساهرة", "يا باب الحوائج يا أبا الفضل",
    "الحسين هو القرآن الممزق", "اللهم ثبت لي قدم صدق عندك مع الحسين", "يا وارث آدم صفوة الله", "العباس نهر الوفاء الذي لا ينضب",
    "عاشوراء مدرسة القيم", "الحسين علمنا أن الكرامة أغلى من الحياة", "صبر العيلة بعد الحسين معجزة", "زينب بطلة كربلاء الشامخة"
];

function setDailyQuote() {
    const today = new Date();
    const index = (today.getFullYear() * 365 + today.getMonth() * 30 + today.getDate()) % dailyQuotes.length;
    const qElem = document.getElementById('quote-text');
    if(qElem) qElem.innerText = dailyQuotes[index];
}

function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    document.documentElement.setAttribute('data-theme', theme);
}

const translations = {
    ar: {
        appTitle: "رثاء الطف", navAudio: "قصائد", navPoets: "شعراء", navPublish: "نشر", navSettings: "إعدادات",
        contestTitle: "📜 قوانين المسابقة", poetsTitle: "القصائد المنشورة", loginTitle: "تسجيل الدخول / حساب جديد",
        loginDesc: "يجب تسجيل الدخول لنشر القصائد أو الإعجاب بها.",
        usernameTitle: "اختر اسم الحساب",
        saveUserBtn: "حفظ الاسم", publishMainTitle: "انشر موهبتك", logoutText: "خروج", pubBtn: "نشر القصيدة",
        quoteTitle: "حكمة اليوم", accountLabel: "اسم الحساب", contactDev: "مراسلة المطور",
        langLabel: "اللغة (Language)", themeLabel: "المظهر (Theme)", versionLabel: "إصدار التطبيق"
    },
    en: {
        appTitle: "Ritha Al-Taff", navAudio: "Audio", navPoets: "Poets", navPublish: "Publish", navSettings: "Settings",
        contestTitle: "📜 Contest Rules", poetsTitle: "Published Poems", loginTitle: "Login / Register",
        loginDesc: "You must login to publish or like poems.",
        usernameTitle: "Choose Username",
        saveUserBtn: "Save Name", publishMainTitle: "Publish Your Talent", logoutText: "Logout", pubBtn: "Publish Poem",
        quoteTitle: "Quote of the Day", accountLabel: "Account Name", contactDev: "Contact Developer",
        langLabel: "Language", themeLabel: "Theme", versionLabel: "App Version"
    }
};

function changeLanguage() {
    const lang = document.getElementById('lang-select').value;
    const t = translations[lang];

    document.getElementById('app-title').innerText = t.appTitle;
    document.getElementById('nav-audio').innerText = t.navAudio;
    document.getElementById('nav-poets').innerText = t.navPoets;
    document.getElementById('nav-publish').innerText = t.navPublish;
    document.getElementById('nav-settings').innerText = t.navSettings;
    document.getElementById('contest-title').innerText = t.contestTitle;
    document.getElementById('poets-title').innerText = t.poetsTitle;
    document.getElementById('login-title').innerText = t.loginTitle;
    document.getElementById('login-desc').innerText = t.loginDesc;
    document.getElementById('username-title').innerText = t.usernameTitle;
    document.getElementById('save-username-btn').innerText = t.saveUserBtn;
    document.getElementById('publish-main-title').innerText = t.publishMainTitle;
    document.getElementById('logout-text').innerText = t.logoutText;
    document.getElementById('pub-btn').innerText = t.pubBtn;
    document.getElementById('quote-title').innerText = t.quoteTitle;
    document.getElementById('account-name-label').innerText = t.accountLabel;
    document.getElementById('contact-dev').innerText = t.contactDev;
    document.getElementById('lang-label').innerText = t.langLabel;
    document.getElementById('theme-label').innerText = t.themeLabel;
    document.getElementById('version-label').innerText = t.versionLabel;

    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
}

// ==========================================
// 6. إعدادات فايربيس (الحقيقية الخاصة بمشروع ritha-al-taff-2)
// ==========================================
var isFirebaseReady = false;

try {
    var firebaseConfig = {
        apiKey: "AIzaSyC76h7g3862hYd0MbeK6gZ-1v4-XmQ8m5k", 
        authDomain: "ritha-al-taff-2.firebaseapp.com",
        databaseURL: "https://ritha-al-taff-2-default-rtdb.firebaseio.com", 
        projectId: "ritha-al-taff-2",
        storageBucket: "ritha-al-taff-2.appspot.com",
        messagingSenderId: "542385109432",
        appId: "1:542385109432:web:ab2134cd56ef7890"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    isFirebaseReady = true;
} catch (error) {
    console.error("Firebase Connection Failed:", error);
}

// ==========================================
// 7. أنظمة الحسابات وتسجيل الدخول بالايميل
// ==========================================
var currentUser = null; 
var currentUsername = null; 

if (isFirebaseReady) {
    try {
        firebase.auth().onAuthStateChanged(function(user) {
            var loginContainer = document.getElementById('login-container');
            var usernameContainer = document.getElementById('username-container');
            var publishContainer = document.getElementById('publish-container');
            var displayUsername = document.getElementById('display-username');

            if (user) {
                currentUser = user;
                firebase.database().ref('users/' + user.uid + '/username').on('value', function(snapshot) {
                    if (snapshot.exists()) {
                        currentUsername = snapshot.val();
                        if(displayUsername) displayUsername.innerText = currentUsername; 
                        if(loginContainer) loginContainer.style.display = 'none';
                        if(usernameContainer) usernameContainer.style.display = 'none';
                        if(publishContainer) publishContainer.style.display = 'block';
                    } else {
                        currentUsername = null;
                        if(displayUsername) displayUsername.innerText = 'بانتظار اختيار الاسم';
                        if(loginContainer) loginContainer.style.display = 'none';
                        if(publishContainer) publishContainer.style.display = 'none';
                        if(usernameContainer) usernameContainer.style.display = 'block'; 
                    }
                });
            } else {
                currentUser = null;
                currentUsername = null;
                if(displayUsername) displayUsername.innerText = 'غير مسجل';
                if(loginContainer) loginContainer.style.display = 'block';
                if(usernameContainer) usernameContainer.style.display = 'none';
                if(publishContainer) publishContainer.style.display = 'none';
            }
            loadApprovedPoems();
        });
    } catch(e) {}
}

function registerWithEmail() {
    if (!isFirebaseReady) return;
    var email = document.getElementById('auth-email').value;
    var pass = document.getElementById('auth-pass').value;
    if (!email || !pass) return alert("يرجى كتابة البريد الإلكتروني وكلمة المرور أولاً!");
    
    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(function() {
        alert("تم إنشاء الحساب بنجاح! الآن اختر اسماً لحسابك.");
    })
    .catch(function(error) {
        alert("حدث خطأ أثناء الإنشاء: " + error.message);
    });
}

function loginWithEmail() {
    if (!isFirebaseReady) return;
    var email = document.getElementById('auth-email').value;
    var pass = document.getElementById('auth-pass').value;
    if (!email || !pass) return alert("يرجى كتابة البريد الإلكتروني وكلمة المرور!");

    firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(function() {
        alert("تم تسجيل الدخول بنجاح.");
    })
    .catch(function(error) {
        alert("خطأ في تسجيل الدخول: " + error.message);
    });
}

function resetPassword() {
    if (!isFirebaseReady) return;
    var email = document.getElementById('auth-email').value;
    if (!email) return alert("الرجاء كتابة بريدك الإلكتروني في الخانة أولاً، ثم اضغط على نسيت كلمة المرور!");

    firebase.auth().sendPasswordResetEmail(email)
    .then(function() {
        alert("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. تفقد صندوق الوارد.");
    })
    .catch(function(error) {
        alert("خطأ: " + error.message);
    });
}

function signOut() { 
    if (isFirebaseReady) {
        firebase.auth().signOut(); 
    }
}

function saveUsername() {
    if (!currentUser || !isFirebaseReady) return;
    var newUsername = document.getElementById('choose-username-input').value.trim();
    newUsername = newUsername.replace(/[.#$\[\]]/g, ""); 
    if (newUsername === '') return alert("الرجاء كتابة اسم صحيح!");

    var usernameRef = firebase.database().ref('usernames/' + newUsername);
    usernameRef.once('value').then(function(snapshot) {
        if (snapshot.exists()) alert("هذا الاسم مستخدم مسبقاً من شخص آخر!");
        else {
            var updates = {};
            updates['usernames/' + newUsername] = currentUser.uid; 
            updates['users/' + currentUser.uid + '/username'] = newUsername; 
            firebase.database().ref().update(updates).then(function() { alert("تم الحفظ بنجاح!"); });
        }
    });
}

// ==========================================
// 8. جلب وعرض القصائد
// ==========================================
function loadApprovedPoems() {
    if (!isFirebaseReady) return;

    try {
        firebase.database().ref('approved_poems').on('value', function(snapshot) {
            var list = document.getElementById('community-poems-li