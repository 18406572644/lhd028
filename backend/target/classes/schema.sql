CREATE DATABASE IF NOT EXISTS cinema_blindbox DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cinema_blindbox;

CREATE TABLE IF NOT EXISTS movie (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50),
    year INT,
    rating DECIMAL(3,1),
    director VARCHAR(500),
    actors VARCHAR(1000),
    description TEXT,
    poster_url VARCHAR(500),
    duration INT,
    country VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    favorite_genres VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blindbox (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    genres VARCHAR(255),
    year_range VARCHAR(20),
    min_rating DOUBLE,
    `count` INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blindbox_movie (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blindbox_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS blindbox_collection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    blindbox_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watch_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    status ENUM('WANT','WATCHING','WATCHED'),
    watched_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    rating INT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS share (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('BLINDBOX','MOVIE'),
    type_id BIGINT,
    share_code VARCHAR(32) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO movie (title, genre, year, rating, director, actors, description, poster_url, duration, country) VALUES
('肖申克的救赎', '剧情', 1994, 9.7, '弗兰克·德拉邦特', '蒂姆·罗宾斯,摩根·弗里曼', '被冤枉的银行家安迪在肖申克监狱中用智慧和毅力赢得自由与尊严', '/posters/shawshank.jpg', 142, '美国'),
('霸王别姬', '剧情/爱情', 1993, 9.6, '陈凯歌', '张国荣,张丰毅,巩俐', '程蝶衣一生痴戏，从一而终，却终究是人生如戏戏如人生', '/posters/farewell.jpg', 171, '中国'),
('阿甘正传', '剧情/喜剧', 1994, 9.5, '罗伯特·泽米吉斯', '汤姆·汉克斯,罗宾·怀特', '智商只有75的阿甘，用他单纯善良的心创造了奇迹般的人生', '/posters/forrest.jpg', 142, '美国'),
('泰坦尼克号', '爱情/灾难', 1997, 9.4, '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥,凯特·温斯莱特', '穷画家与贵族少女在泰坦尼克号上相遇相爱，灾难来临时不离不弃', '/posters/titanic.jpg', 194, '美国'),
('千与千寻', '动画/奇幻', 2001, 9.4, '宫崎骏', '柊瑠美,入野自由', '少女千寻误入神灵世界，在汤屋工作中成长，勇敢面对困境', '/posters/spirited.jpg', 125, '日本'),
('盗梦空间', '科幻/悬疑', 2010, 9.3, '克里斯托弗·诺兰', '莱昂纳多·迪卡普里奥,渡边谦', '造梦师柯布带领团队深入他人梦境，执行最危险的一次植入任务', '/posters/inception.jpg', 148, '美国'),
('星际穿越', '科幻/冒险', 2014, 9.4, '克里斯托弗·诺兰', '马修·麦康纳,安妮·海瑟薇', '前NASA飞行员穿越虫洞寻找人类新家园，同时与女儿跨越时空的爱', '/posters/interstellar.jpg', 169, '美国'),
('楚门的世界', '剧情/科幻', 1998, 9.3, '彼得·威尔', '金·凯瑞,劳拉·琳妮', '楚门从出生起就生活在一个巨大的摄影棚中，他的一切都是真人秀', '/posters/truman.jpg', 103, '美国'),
('忠犬八公的故事', '剧情', 2009, 9.4, '拉斯·霍尔斯道姆', '理查·基尔,萨拉·罗默尔', '秋田犬八公在主人去世后，每天到车站等待主人归来，一等就是九年', '/posters/hachiko.jpg', 93, '美国'),
('三傻大闹宝莱坞', '剧情/喜剧', 2009, 9.2, '拉吉库马尔·希拉尼', '阿米尔·汗,马德哈万', '三个好友在印度顶尖工程学院的求学故事，反思教育制度', '/posters/3idiots.jpg', 171, '印度'),
('疯狂动物城', '动画/冒险', 2016, 9.2, '拜伦·霍华德', '金妮弗·古德温,杰森·贝特曼', '兔子朱迪成为动物城第一位兔子警官，与狐狸尼克搭档破案', '/posters/zootopia.jpg', 108, '美国'),
('寻梦环游记', '动画/奇幻', 2017, 9.1, '李·昂克里奇', '安东尼·冈萨雷斯,盖尔·加西亚', '小男孩米格尔在亡灵节误入亡灵世界，寻找音乐梦想与家族秘密', '/posters/coco.jpg', 105, '美国'),
('哪吒之魔童降世', '动画/奇幻', 2019, 8.5, '饺子', '吕艳婷,囧森瑟夫', '魔丸转世的哪吒面对命运不公，喊出"我命由我不由天"', '/posters/nezha.jpg', 110, '中国'),
('流浪地球', '科幻/冒险', 2019, 7.9, '郭帆', '屈楚萧,吴京,李光洁', '太阳即将毁灭，人类开启"流浪地球"计划，带着地球一起逃离太阳系', '/posters/wandering.jpg', 125, '中国'),
('寄生虫', '剧情/悬疑', 2019, 8.8, '奉俊昊', '宋康昊,李善均,赵汝贞', '贫困家庭巧妙渗透进富裕家庭，揭示社会阶层的巨大鸿沟', '/posters/parasite.jpg', 132, '韩国'),
('你的名字', '动画/爱情', 2016, 8.4, '新海诚', '神木隆之介,上白石萌音', '乡村少女三叶与东京少年泷在梦中交换身体，跨越时空寻找彼此', '/posters/yourname.jpg', 106, '日本'),
('飞屋环游记', '动画/冒险', 2009, 9.0, '彼特·道格特', '爱德·阿斯纳,乔丹·长井', '78岁的卡尔用气球带着房子飞向南美洲，完成与妻子的约定', '/posters/up.jpg', 96, '美国'),
('大话西游之大圣娶亲', '喜剧/奇幻', 1995, 9.2, '刘镇伟', '周星驰,朱茵,莫文蔚', '至尊宝为了救紫霞仙子戴上紧箍咒，从此不能再爱', '/posters/westjourney.jpg', 99, '中国'),
('辛德勒的列表', '剧情/历史', 1993, 9.5, '史蒂文·斯皮尔伯格', '连姆·尼森,本·金斯利', '德国商人辛德勒在二战中倾家荡产拯救了一千多名犹太人', '/posters/schindler.jpg', 195, '美国'),
('龙猫', '动画/奇幻', 1988, 9.2, '宫崎骏', '日高法子,的場未華子', '两姐妹搬到乡下后遇到森林精灵龙猫，展开了一段温馨奇幻的冒险', '/posters/totoro.jpg', 86, '日本');
