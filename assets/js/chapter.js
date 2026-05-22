/**
 * 章节页通用逻辑：音乐解锁、翻页、返回目录
 * 在 <body> 上设置 data-menu-url、data-end-chapter（返回目录的 chap 索引，默认 3）
 */
(function () {
    const body = document.body;
    const menuUrl = body.dataset.menuUrl || '/menu.html';
    const endChapter = parseInt(body.dataset.endChapter || '3', 10);

    let currentChapter = 0;
    const bgm = document.getElementById('bgm');
    if (bgm) bgm.volume = 0.5;

    let audioUnlocked = false;
    function unlockAudio() {
        if (!audioUnlocked && bgm) {
            bgm.play().then(() => {
                bgm.pause();
                audioUnlocked = true;
                document.removeEventListener('touchstart', unlockAudio);
            }).catch(() => {});
        }
    }
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    window.startStory = function () {
        if (!bgm) {
            nextChapter(1);
            return;
        }
        const playPromise = bgm.play();
        if (playPromise !== undefined) {
            playPromise.then(() => nextChapter(1)).catch(() => nextChapter(1));
        } else {
            nextChapter(1);
        }
    };

    window.nextChapter = function (chapIndex) {
        if (chapIndex === endChapter) {
            window.location.href = menuUrl;
            return;
        }

        document.getElementById(`chap-${currentChapter}`).classList.remove('active');
        currentChapter = chapIndex;
        document.getElementById(`chap-${currentChapter}`).classList.add('active');

        if (window.ParticleEffects && window.ParticleEffects.onChapterChange) {
            window.ParticleEffects.onChapterChange(currentChapter);
        }
    };

    window.ChapterApp = { getCurrentChapter: () => currentChapter };
})();
