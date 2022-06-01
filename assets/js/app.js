const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const playlist = $(".playlist");
const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Thức Giấc",
            singer: "Da LAB",
            path: "./assets/music/thucgiac.mp3",
            image: "./assets/img/thucgiac.jpg",
        },
        {
            name: "Đế Vương",
            singer: "Đình Dũng, ACV",
            path: "./assets/music/devuong.mp3",
            image: "./assets/img/devuong.jpg",
        },
        {
            name: "Cưới Thôi",
            singer: "Masew, Masiu, B Ray, V.A",
            path: "./assets/music/cuoithoi.mp3",
            image: "./assets/img/cuoithoi.jpg",
        },
        {
            name: "Ái Nộ",
            singer: "Masew, Khôi Vũ",
            path: "./assets/music/aino.mp3",
            image: "./assets/img/aino.jpg",
        },
        {
            name: "Sài Gòn Đau Lòng Quá",
            singer: "Hứa Kim Tuyền, Hoàng Duyên",
            path: "./assets/music/saigondaulongqua.mp3",
            image: "./assets/img/saigondaulongqua.jpg",
        },
        {
            name: "Phải Chăng Em Đã Yêu?",
            singer: "Juky San, RedT",
            path: "./assets/music/phaichangemdayeu.mp3",
            image: "./assets/img/phaichangemdayeu.jpg",
        },
        {
            name: "Ai Chung Tình Được Mãi",
            singer: "Thương Võ, ACV",
            path: "https://data.chiasenhac.com/down2/2245/2/2244526-58016f27/128/Ai%20Chung%20Tinh%20Duoc%20Mai%20-%20Thuong%20Vo_%20ACV.mp3",
            image: "https://data.chiasenhac.com/data/cover/163/162555.jpg",
        },
        {
            name: "Yêu 5",
            singer: "Rhymastic",
            path: "https://data3.chiasenhac.com/downloads/2110/2/2109060-cf68a78b/128/Yeu%205%20-%20Rhymastic.mp3",
            image: "https://data.chiasenhac.com/data/cover/126/125590.jpg",
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value ;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)); 
    },

    render: function () {
        // Đưa ra danh sách nhạc
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`;
        });

        $(".playlist").innerHTML = htmls.join("");
    },

    defineProperty: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [
                { 
                    transform: 'rotate(360deg)' 
                }
            ], 
            { 
                duration: 10000,        // Thời gian quay
                iterations: Infinity    // Số lần lặp
            }
        );
        
        cdThumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý play nhạc
        playBtn.onclick = function() {
            app.isPlaying ? audio.pause() : audio.play();
        }

        // Khi nhạc được play
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        }

        // Khi nhạc bị pause
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài nhạc thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua nhạc
        progress.oninput = function(e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        // Khi prev bài nhạc
        prevBtn.onclick = function() {
            app.isRandom ? app.randomSong() : app.prevSong();
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }

        // Khi next bài nhạc
        nextBtn.onclick = function() {
            app.isRandom ? app.randomSong() : app.nextSong();
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }

        // Xử lý lặp lại nhạc
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig("isRepeat", app.isRepeat);
            repeatBtn.classList.toggle("active", app.isRepeat);
        }

        // Xử lý random nhạc
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom);
            randomBtn.classList.toggle("active", app.isRandom);
        }

        // Xử lý next nhạc khi audio kết thúc
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Xử lý hành vi click vào playlist
        playlist.onclick = function(e) {
            const songElement = e.target.closest('.song:not(.active)');
            const optionElement = e.target.closest('.option');

            if(songElement || !optionElement) {
                // Xử lý khi click vào song
                if(songElement) {
                    app.currentIndex = Number(songElement.dataset.index);
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }

                // Xử lý khi click vào option
                if(!optionElement) {
                }
            }
        }
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            if ((app.currentIndex === 0, 1)) {
                $(".song.active").scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              } else {
                $(".song.active").scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
        }, 300);
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    start: function () {
        // Định nghĩa các thuộc tính cho Object
        this.defineProperty();

        // Lắng nghe / xử lí các sự kiện (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vaò UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();
    },
};

app.start();
