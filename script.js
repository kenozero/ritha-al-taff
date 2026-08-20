const translations = {
    ar: {
        app_title: "رثاء الطف", tab_poets: "شعراء", tab_publish: "نشر", tab_settings: "إعدادات",
        quote_title: "حكمة اليوم", account_name: "اسم الحساب", contact_dev: "مراسلة المطور",
        language: "اللغة", theme: "المظهر", version: "إصدار التطبيق", published_poems: "القصائد المنشورة",
        read_full: "إقرأ القصيدة كاملة", by_poet: "الشاعر:", by_user: "بواسطة:",
        splash_1: "صَلِّ على نبيّكَ الأكرم", splash_2: "اللهم صلِّ على محمد وآل محمد",
        login_title: "تسجيل الدخول", logout_text: "خروج", pub_btn: "نشر القصيدة",
        search_placeholder: "ابحث عن قصيدة أو شاعر...", publish_main_title: "انشر موهبتك",
        theme_dark: "داكن ملكي", theme_light: "أبيض", pub_name_ph: "اسم الشاعر", pub_title_ph: "اسم القصيدة", pub_poem_ph: "اكتب القصيدة كاملة هنا..."
    },
    en: {
        app_title: "Ritha Al-Taff", tab_poets: "Poets", tab_publish: "Publish", tab_settings: "Settings",
        quote_title: "Quote of the Day", account_name: "Account Name", contact_dev: "Contact Developer",
        language: "Language", theme: "Theme", version: "App Version", published_poems: "Published Poems",
        read_full: "Read Full Poem", by_poet: "Poet:", by_user: "By:",
        splash_1: "Blessings upon the Prophet", splash_2: "O Allah, bless Muhammad...",
        login_title: "Login", logout_text: "Logout", pub_btn: "Publish",
        search_placeholder: "Search...", publish_main_title: "Share Your Talent",
        theme_dark: "Dark", theme_light: "Light", pub_name_ph: "Poet Name", pub_title_ph: "Poem Title", pub_poem_ph: "Write full poem here..."
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
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
    });
    loadApprovedPoems();
}

// ==========================================
// 1. نظام النافذة الكاملة (Full Page Modal)
// ==========================================
function ensureModalExists() {
    if (!document.getElementById('full-page-poem-modal')) {
        const modalHTML = `
        <div id="full-page-poem-modal" class="full-page-modal">
            <div class="modal-header-nav">
                <button onclick="closePoemModal()" class="back-btn"><i class="fa-solid fa-arrow-right"></i></button>
                <h2 id="modal-poem-title" class="gold-text modal-main-title"></h2>
                <div style="width: 24px;"></div>
            </div>
            <div class="modal-meta-info">
                <div class="meta-item"><i class="fa-solid fa-feather-pointed"></i> الشاعر: <span id="modal-poem-poet"></span></div>
                <div class="meta-item"><i class="fa-solid fa-user"></i> الناشر: <span id="modal-poem-uploader" dir="ltr"></span></div>
            </div>
            <div class="modal-body-content">
                <p id="modal-poem-text" class="amiri-text"></p>
            </div>
            <div class="modal-bottom-actions">
                <button id="modal-like-btn" class="action-btn like-btn"></button>
                <button onclick="copyCurrentPoem()" class="action-btn outline-gold"><i class="fa-solid fa-copy"></i> نسخ</button>
                <button onclick="shareCurrentPoem()" class="action-btn outline-gold"><i class="fa-solid fa-share-nodes"></i> مشاركة</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function openCommunityPoemModal(poemId) {
    const poem = (window.allApprovedPoems || []).find(p => p.id === poemId);
    if (!poem) return;
    ensureModalExists();
    
    document.getElementById('modal-poem-title').innerText = poem.title;
    document.getElementById('modal-poem-poet').innerText = poem.poet;
    document.getElementById('modal-poem-uploader').innerText = `@${poem.uploaderUsername || 'مجهول'}`;
    document.getElementById('modal-poem-text').innerText = poem.text;
    
    const isLiked = currentUser && poem.likedBy && poem.likedBy[currentUser.uid] ? true : false;
    const likeBtn = document.getElementById('modal-like-btn');
    likeBtn.innerHTML = `${isLiked ? '❤️' : '🤍'} <span class="gold-text">${poem.likes || 0}</span>`;
    likeBtn.onclick = function() { toggleLike(poem.id); setTimeout(() => openCommunityPoemModal(poem.id), 250); };

    const modal = document.getElementById('full-page-poem-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden'; 
}

function closePoemModal() {
    const modal = document.getElementById('full-page-poem-modal');
    if (modal) { 
        modal.classList.remove('active'); 
        setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
    }
}

function copyCurrentPoem() {
    const title = document.getElementById('modal-poem-title').innerText;
    const text = document.getElementById('modal-poem-text').innerText;
    navigator.clipboard.writeText(`*${title}*\n\n${text}\n\n- تم النسخ من تطبيق رثاء الطف`).then(() => alert("تم النسخ!"));
}

function shareCurrentPoem() {
    const title = document.getElementById('modal-poem-title').innerText;
    const text = document.getElementById('modal-poem-text').innerText;
    if (navigator.share) {
        navigator.share({ title: title, text: `*${title}*\n\n${text}\n\n- عبر تطبيق رثاء الطف` }).catch(e => console.log(e));
    } else {
        alert("المشاركة غير مدعومة في جهازك، استخدم النسخ.");
    }
}

// ==========================================
// 2. الفايربيس والمصادقة
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
    } catch (error) { console.error("Firebase Error:", error); }
}

function setupFirebaseAuth() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            firebase.database().ref('users/' + user.uid + '/username').once('value').then(snap => {
                currentUsername = snap.exists() ? snap.val() : (user.email ? user.email.split('@')[0] : "مستخدم");
                document.getElementById('display-username').innerText = currentUsername;
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('publish-container').style.display = 'block';
            });
        } else {
            currentUser = null; currentUsername = null;
            document.getElementById('display-username').innerText = "غير مسجل";
            document.getElementById('login-container').style.display = 'block';
            document.getElementById('publish-container').style.display = 'none';
        }
        loadApprovedPoems();
    });
}

function toggleAuthMode(mode) {
    const userField = document.getElementById('auth-username');
    const loginBtns = document.getElementById('login-btns-group');
    const regBtns = document.getElementById('register-btns-group');
    const title = document.getElementById('auth-main-title');
    if (mode === 'register') {
        userField.style.display = 'block'; loginBtns.style.display = 'none'; regBtns.style.display = 'flex'; title.innerText = "إنشاء حساب جديد";
    } else {
        userField.style.display = 'none'; loginBtns.style.display = 'flex'; regBtns.style.display = 'none'; title.innerText = "تسجيل الدخول";
    }
}

function loginUser() { 
    if (!isFirebaseReady) return;
    firebase.auth().signInWithEmailAndPassword(document.getElementById('auth-email').value, document.getElementById('auth-pass').value)
    .catch(err => alert("البيانات خاطئة.")); 
}

function registerUser() { 
    if (!isFirebaseReady) return;
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    const username = document.getElementById('auth-username').value.trim();
    if(!username || !email || !pass) return alert("املا الحقول بالكامل.");
    firebase.auth().createUserWithEmailAndPassword(email, pass).then(res => {
        firebase.database().ref('users/' + res.user.uid).set({ username: username, email: email }).then(() => alert("تم إنشاء الحساب!"));
    }).catch(err => alert("خطأ: " + err.message)); 
}
function logoutUser() { firebase.auth().signOut(); }
function resetPasswordPrompt() {
    var email = prompt("أدخل بريدك الإلكتروني لتعيين كلمة مرور جديدة:");
    if (email && email.trim() !== "") firebase.auth().sendPasswordResetEmail(email.trim()).then(() => alert("تم الإرسال!")).catch(err => alert("خطأ!"));
}

// ==========================================
// 3. عرض البطاقات المصغرة (سطر واحد مرتب)
// ==========================================
function updateContestBoard(poemsArray) {
    var contestBoard = document.getElementById('weekly-contest-board');
    if (!contestBoard || !poemsArray || poemsArray.length === 0) return;
    
    var winner = poemsArray.reduce((prev, current) => ((current.likes || 0) > (prev.likes || 0)) ? current : prev, poemsArray[0]);
    if (!winner || (winner.likes || 0) === 0) return;

    var firstLine = (winner.text || '').split(/\r?\n/)[0].trim();
    var isLiked = currentUser && winner.likedBy && winner.likedBy[currentUser.uid] ? true : false;
    
    contestBoard.innerHTML = `
        <div class="winner-badge"><i class="fa-solid fa-trophy"></i> فائز الأسبوع</div>
        <div class="premium-card poem-preview-card" onclick="openCommunityPoemModal('${winner.id}')" style="border-color: var(--gold);">
            <div class="poem-card-header">
                <div class="poem-meta-row" style="margin-bottom: 8px;">
                    <span dir="ltr"><i class="fa-solid fa-user"></i> @${winner.uploaderUsername || 'مجهول'}</span>
                    <span><i class="fa-solid fa-feather-pointed"></i> ${winner.poet}</span>
                </div>
                <h3 class="gold-text poem-title">${winner.title}</h3>
            </div>
            <div class="poem-single-line">
                <p class="amiri-text">${firstLine}</p>
            </div>
            <div class="poem-card-footer">
                <span class="read-more-text">${translations[currentLang].read_full} <i class="fa-solid fa-arrow-left"></i></span>
                <button onclick="event.stopPropagation(); toggleLike('${winner.id}')" class="like-btn-inline">
                    ${isLiked ? '❤️' : '🤍'} <span class="gold-text">${winner.likes || 0}</span>
                </button>
            </div>
        </div>`;
}

function loadApprovedPoems() {
    if (!isFirebaseReady) return;
    firebase.database().ref('approved_poems').on('value', function(snapshot) {
        var list = document.getElementById('community-poems-list');
        if (!list) return;
        list.innerHTML = ''; 
        if (!snapshot.exists()) return;

        var poemsArray = [];
        snapshot.forEach(child => { var item = child.val(); item.id = child.key; poemsArray.push(item); });
        for (let i = poemsArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [poemsArray[i], poemsArray[j]] = [poemsArray[j], poemsArray[i]]; }
        window.allApprovedPoems = poemsArray; 
        
        updateContestBoard(poemsArray);

        poemsArray.forEach(data => {
            var isLiked = currentUser && data.likedBy && data.likedBy[currentUser.uid] ? true : false;
            var firstLine = (data.text || '').split(/\r?\n/)[0].trim();
            const safeFilter = (data.title + " " + data.poet + " " + data.text).toLowerCase();
            
            list.innerHTML += `
            <div class="premium-card poem-preview-card community-poem-card" data-filter="${safeFilter}" onclick="openCommunityPoemModal('${data.id}')">
                <div class="poem-card-header">
                    <div class="poem-meta-row" style="margin-bottom: 8px;">
                        <span dir="ltr"><i class="fa-solid fa-user"></i> @${data.uploaderUsername || 'مجهول'}</span>
                        <span><i class="fa-solid fa-feather-pointed"></i> ${data.poet}</span>
                    </div>
                    <h3 class="gold-text poem-title">${data.title}</h3>
                </div>
                <div class="poem-single-line">
                    <p class="amiri-text">${firstLine}</p>
                </div>
                <div class="poem-card-footer">
                    <span class="read-more-text">${translations[currentLang].read_full} <i class="fa-solid fa-arrow-left"></i></span>
                    <button onclick="event.stopPropagation(); toggleLike('${data.id}')" class="like-btn-inline">
                        ${isLiked ? '❤️' : '🤍'} <span class="gold-text">${data.likes || 0}</span>
                    </button>
                </div>
            </div>`;
        });
    });
}

function searchCommunityPoems() {
    const query = (document.getElementById('search-community-input')?.value || '').toLowerCase().trim();
    document.querySelectorAll('.community-poem-card').forEach(card => {
        card.style.display = card.getAttribute('data-filter').includes(query) ? 'block' : 'none';
    });
}

function toggleLike(poemId) {
    if (!isFirebaseReady || !currentUser) return alert("سجل دخولك للإعجاب!");
    var uid = currentUser.uid;
    var poemRef = firebase.database().ref('approved_poems/' + poemId);
    var userLikeRef = poemRef.child('likedBy/' + uid);
    userLikeRef.once('value').then(snap => {
        poemRef.child('likes').once('value').then(lSnap => {
            var likes = lSnap.val() || 0;
            if (snap.exists()) { userLikeRef.remove(); poemRef.child('likes').set(likes - 1); } 
            else { userLikeRef.set(true); poemRef.child('likes').set(likes + 1); }
        });
    });
}

// ==========================================
// 4. النشر والفلتر
// ==========================================
function submitPoem() {
    if (!isFirebaseReady || !currentUser) return alert("سجل دخولك أولاً!");
    var name = document.getElementById('pub-name').value.trim();
    var title = document.getElementById('pub-title').value.trim();
    var text = document.getElementById('pub-poem').value.trim();
    if (!name || !title || !text) return alert("املا الحقول بالكامل!");

    const badWords = ["غبي", "حمار", "تافه", "حقير", "سخيف", "قذر", "لعنة"];
    let hasBadWords = false;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        if (regex.test(text) || regex.test(title) || regex.test(name)) {
            hasBadWords = true; text = text.replace(regex, '[مرفوض]');
        }
    });

    var btn = document.getElementById('pub-btn'); btn.disabled = true; btn.innerText = "جاري الإرسال...";
    firebase.database().ref('pending_poems').push({
        poet: name.replace(/[&<>'"]/g, ''), title: title.replace(/[&<>'"]/g, ''), text: text.replace(/[&<>'"]/g, ''), 
        uploaderUsername: currentUsername || "مستخدم", uid: currentUser.uid, likes: 0, timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        alert("تم الإرسال للمراجعة بنجاح!");
        document.getElementById('pub-name').value = ''; document.getElementById('pub-title').value = ''; document.getElementById('pub-poem').value = '';
        switchTab('poets', document.querySelectorAll('.nav-item')[0]); 
    }).finally(() => { btn.disabled = false; btn.innerText = "نشر القصيدة"; });
}

function setDailyQuote() {
    const dailyQuotes = ["من راقب الناس مات هماً، ومن راقب الحسين عاش حراً", "الحسين ليس شخصاً، بل هو مشروع إنساني متكامل", "إن كان دين محمد لم يستقم إلا بقتلي، يا سيوف خذيني"];
    document.getElementById('quote-text').innerText = dailyQuotes[Math.floor(Math.abs(new Date() - new Date('2024-01-01')) / 86400000) % dailyQuotes.length];
}
function changeTheme() { document.documentElement.setAttribute('data-theme', document.getElementById('theme-select').value); }
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('section-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// ==========================================
// 5. جلب رابط المطور من فايربيس وفتحه خارجياً
// ==========================================
function openTikTok() {
    var fallbackUrl = "https://www.tiktok.com/@KENO_ZERO";

    if (!isFirebaseReady) {
        executeLink(fallbackUrl);
        return;
    }

    firebase.database().ref('app_settings/developer_link').once('value').then(function(snapshot) {
        var finalUrl = snapshot.exists() ? snapshot.val() : fallbackUrl;
        executeLink(finalUrl);
    }).catch(function(error) {
        executeLink(fallbackUrl);
    });
}

function executeLink(url) {
    if (window.median && window.median.openURL) {
        window.median.openURL.external(url);
    } else if (window.gonative && window.gonative.openURL) {
        window.gonative.openURL.external(url);
    } else {
        window.open(url, '_blank');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => { document.getElementById('splash-screen')?.remove(); }, 2500);
    changeLanguage(currentLang); initFirebaseApp(); setDailyQuote(); 
    document.getElementById('language-select').value = currentLang;
});
