// ==========================================
// 1. نظام تحميل الصوتيات والمشغل والبحث
// ==========================================
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
                    <div style="width: 45px; height: 45px; border-radius: 50%; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; background: rgba(212, 175, 55, 0.05);">
                        <i class="fa-solid fa-music gold-text" style="font-size: 18px;"></i>
                    </div>
                </div>

                <div class="custom-audio-player">
                    <audio id="audio-${trackId}" src="${track.file}" style="display:none;" 
                        ontimeupdate="updateTime('${trackId}')" 
                        onloadedmetadata="setDuration('${trackId}')" 
                        onended="resetPlayer('${trackId}')"></audio>
                    
                    <div class="player-main-row">
                        <div class="controls-group">
                            <button onclick="skipTime('${trackId}', -10)" class="skip-btn">
                                <i class="fa-solid fa-backward-10"></i>
                            </button>
                            <button id="playBtn-${trackId}" class="play-pause-btn" onclick="togglePlay('${trackId}')">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button onclick="skipTime('${trackId}', 10)" class="skip-btn">
                                <i class="fa-solid fa-forward-10"></i>
                            </button>
                        </div>
                        <div class="progress-container">
                            <input type="range" id="seek-${trackId}" value="0" max="100" onchange="seekAudio('${trackId}', this.value)" oninput="seekAudio('${trackId}', this.value)">
                            <div class="time-display" id="time-${trackId}">0:00 / 0:00</div>
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

// دالة البحث الفورية للقصائد
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

function togglePlay(id) {
    const audio = document.getElementById(`audio-${id}`);
    const playBtn = document.getElementById(`playBtn-${id}`);
    
    document.querySelectorAll('audio').forEach(a => {
        if(a.id !== `audio-${id}`) {
            a.pause();
            const otherId = a.id.split('-')[1];
            document.getElementById(`playBtn-${otherId}`).innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });

    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function updateTime(id) {
    const audio = document.getElementById(`audio-${id}`);
    const seekBar = document.getElementById(`seek-${id}`);
    const timeDisplay = document.getElementById(`time-${id}`);

    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        seekBar.value = percent;
        seekBar.style.setProperty('--progress', percent + '%'); 
        timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
}

function setDuration(id) {
    const audio = document.getElementById(`audio-${id}`);
    const timeDisplay = document.getElementById(`time-${id}`);
    timeDisplay.innerText = `0:00 / ${formatTime(audio.duration)}`;
}

function seekAudio(id, percent) {
    const audio = document.getElementById(`audio-${id}`);
    const seekBar = document.getElementById(`seek-${id}`);
    if (audio.duration) {
        audio.currentTime = (percent / 100) * audio.duration;
        seekBar.style.setProperty('--progress', percent + '%');
    }
}

function skipTime(id, seconds) {
    const audio = document.getElementById(`audio-${id}`);
    if (audio.duration) audio.currentTime += seconds;
}

function resetPlayer(id) {
    const playBtn = document.getElementById(`playBtn-${id}`);
    const seekBar = document.getElementById(`seek-${id}`);
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    seekBar.value = 0;
    seekBar.style.setProperty('--progress', '0%');
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================
// 3. حكمة اليوم التلقائية
// ==========================================
const dailyQuotes = [
    "من راقب الناس مات هماً، ومن راقب الحسين عاش حراً",
    "الحسين ليس شخصاً، بل هو مشروع إنساني متكامل",
    "إن كان دين محمد لم يستقم إلا بقتلي، يا سيوف خذيني",
    "هيهات منا الذلة",
    "كل يوم عاشوراء وكل أرض كربلاء",
    "البكاء على الحسين رسالة ثورة",
    "تعلمت من الحسين كيف أكون مظلوماً فأنتصر"
];

function setDailyQuote() {
    const today = new Date();
    const index = (today.getFullYear() + today.getMonth() + today.getDate()) % dailyQuotes.length;
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
        contestTitle: "📜 قوانين المسابقة", poetsTitle: "القصائد المنشورة", loginTitle: "تسجيل الدخول مطلوب",
        loginDesc: "لحماية المسابقة، يجب تسجيل الدخول بحساب Google لنشر القصائد أو الإعجاب بها.",
        loginBtnText: "المتابعة باستخدام Google", usernameTitle: "اختر اسم الحساب",
        saveUserBtn: "حفظ الاسم", publishMainTitle: "انشر موهبتك", logoutText: "خروج", pubBtn: "نشر القصيدة",
        quoteTitle: "حكمة اليوم", accountLabel: "اسم الحساب", contactDev: "مراسلة المطور",
        langLabel: "اللغة (Language)", themeLabel: "المظهر (Theme)", versionLabel: "إصدار التطبيق"
    },
    en: {
        appTitle: "Ritha Al-Taff", navAudio: "Audio", navPoets: "Poets", navPublish: "Publish", navSettings: "Settings",
        contestTitle: "📜 Contest Rules", poetsTitle: "Published Poems", loginTitle: "Login Required",
        loginDesc: "To protect the contest, you must login with Google to publish or like poems.",
        loginBtnText: "Continue with Google", usernameTitle: "Choose Username",
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
    document.getElementById('login-btn-text').innerText = t.loginBtnText;
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
// 6. إعدادات فايربيس المحدثة (ritha-al-taff-2)
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
// 7. أنظمة الحسابات وتسجيل الدخول
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

function signInWithGoogle() {
    if (!isFirebaseReady) return;
    try {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider); 
    } catch(e) { 
        console.error("Login initialization failed: ", e);
    }
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
// 8. جلب وعرض القصائد (يعمل بشكل فوري)
// ==========================================
function loadApprovedPoems() {
    if (!isFirebaseReady) return;
    
    try {
        firebase.database().ref('approved_poems').on('value', function(snapshot) {
            var list = document.getElementById('community-poems-list');
            if (!list) return;
            list.innerHTML = ''; 
            
            if (!snapshot.exists()) {
                list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد قصائد منشورة حالياً!</p>';
                return;
            }
            
            var poemsArray = [];
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.id = childSnapshot.key;
                poemsArray.push(item);
            });
            poemsArray.reverse(); 

            poemsArray.forEach(function(data) {
                var isLikedByMe = currentUser && data.likedBy && data.likedBy[currentUser.uid] ? true : false;
                var heartIcon = isLikedByMe ? '❤️' : '🤍';
                
                list.innerHTML += `
                <div class="premium-card" style="padding: 20px;">
                    <h3 class="gold-text" style="margin-bottom: 5px;">${data.title}</h3>
                    <p style="color: var(--ruby-purple); font-size: 0.9em; margin-bottom: 5px;">الشاعر: ${data.poet}</p>
                    <p style="color: var(--text-muted); font-size: 0.75em; margin-bottom: 15px;">نُشرت بواسطة حساب: @${data.uploaderUsername || 'مجهول'}</p>
                    <p class="amiri-text" style="color: var(--text-main); white-space: pre-wrap; line-height: 1.8;">${data.text}</p>
                    <div style="text-align: left; margin-top: 15px; border-top: 1px dashed var(--ruby-purple); padding-top: 10px;">
                        <button onclick="toggleLike('${data.id}')" style="background: none; border: none; cursor: pointer; font-size: 22px;">
                            ${heartIcon} <span class="gold-text">${data.likes || 0}</span>
                        </button>
                    </div>
                </div>`;
            });
        });
    } catch(e) {}
}

function toggleLike(poemId) {
    if (!isFirebaseReady) return;
    if (!currentUser || !currentUsername) return alert("يجب تسجيل الدخول للإعجاب بالقصائد!");
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

function submitPoem() {
    if (!isFirebaseReady) return;
    if (!currentUser || !currentUsername) return alert("سجل دخولك أولاً لكي تتمكن من النشر!");
    var name = document.getElementById('pub-name').value;
    var title = document.getElementById('pub-title').value;
    var text = document.getElementById('pub-poem').value;
    if (name === '' || title === '' || text === '') return alert("يرجى ملء جميع الحقول!");
    
    firebase.database().ref('approved_poems').push({
        poet: name, title: title, text: text, 
        uploaderUsername: currentUsername, uid: currentUser.uid, 
        likes: 0,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
        alert("تم نشر قصيدتك بنجاح! اذهب لقسم 'شعراء' لرؤيتها فوراً.");
        document.getElementById('pub-name').value = ''; 
        document.getElementById('pub-title').value = ''; 
        document.getElementById('pub-poem').value = '';
        
        document.querySelector("button[onclick=\"switchTab('poets', this)\"]").click();
    }).catch(function(err) {
        alert("حدث خطأ أثناء النشر: " + err.message);
    });
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(function(tab) { tab.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function(item) { item.classList.remove('active'); });
    document.getElementById('section-' + tabId).classList.add('active');
    btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    loadAudioList(); 
    setDailyQuote(); 
});
