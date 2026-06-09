import { create } from 'zustand';
import request from '@/utils/request';

export interface Movie {
  id: number;
  title: string;
  poster: string;
  director: string;
  actors: string;
  genre: string;
  releaseDate: string;
  rating: number;
  description: string;
  duration: number;
  country: string;
}

interface MovieFilters {
  keyword: string;
  genre: string;
}

interface MovieState {
  movies: Movie[];
  currentMovie: Movie | null;
  filters: MovieFilters;
  loading: boolean;
  fetchMovies: () => Promise<void>;
  fetchMovieById: (id: number) => Promise<void>;
  setFilters: (filters: Partial<MovieFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: MovieFilters = {
  keyword: '',
  genre: '',
};

const mockMovies: Movie[] = [
  {
    id: 1, title: '肖申克的救赎', director: '弗兰克·德拉邦特', actors: '蒂姆·罗宾斯, 摩根·弗里曼', genre: '剧情',
    releaseDate: '1994-09-23', rating: 9.7, description: '被冤枉的银行家安迪在肖申克监狱中用智慧和毅力赢得自由与尊严', duration: 142, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prison%20bars%20with%20warm%20sunlight%20streaming%20through%2C%20hope%20and%20freedom%20cinematic%20poster%20dramatic%20lighting&image_size=portrait_4_3',
  },
  {
    id: 2, title: '霸王别姬', director: '陈凯歌', actors: '张国荣, 张丰毅, 巩俐', genre: '剧情',
    releaseDate: '1993-01-12', rating: 9.6, description: '程蝶衣一生痴戏，从一而终，却终究是人生如戏戏如人生', duration: 171, country: '中国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20opera%20stage%20dramatic%20face%20paint%20tragedy%20cinematic%20vintage&image_size=portrait_4_3',
  },
  {
    id: 3, title: '阿甘正传', director: '罗伯特·泽米吉斯', actors: '汤姆·汉克斯, 罗宾·怀特', genre: '剧情',
    releaseDate: '1994-07-06', rating: 9.5, description: '智商只有75的阿甘，用他单纯善良的心创造了奇迹般的人生', duration: 142, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=park%20bench%20feather%20running%20American%20flag%20heartwarming%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 4, title: '泰坦尼克号', director: '詹姆斯·卡梅隆', actors: '莱昂纳多·迪卡普里奥, 凯特·温斯莱特', genre: '爱情',
    releaseDate: '1997-12-19', rating: 9.4, description: '穷画家与贵族少女在泰坦尼克号上相遇相爱，灾难来临时不离不弃', duration: 194, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20ship%20bow%20sunset%20ocean%20romance%20epic%20cinematic%20golden%20hour&image_size=portrait_4_3',
  },
  {
    id: 5, title: '千与千寻', director: '宫崎骏', actors: '柊瑠美, 入野自由', genre: '动画',
    releaseDate: '2001-07-20', rating: 9.4, description: '少女千寻误入神灵世界，在汤屋工作中成长，勇敢面对困境', duration: 125, country: '日本',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bathhouse%20spirit%20world%20magical%20night%20lanterns%20anime%20style%20ethereal&image_size=portrait_4_3',
  },
  {
    id: 6, title: '盗梦空间', director: '克里斯托弗·诺兰', actors: '莱昂纳多·迪卡普里奥, 渡边谦', genre: '科幻',
    releaseDate: '2010-07-16', rating: 9.3, description: '造梦师柯布带领团队深入他人梦境，执行最危险的一次植入任务', duration: 148, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20city%20architecture%20dream%20layers%20surreal%20sci-fi%20thriller%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 7, title: '星际穿越', director: '克里斯托弗·诺兰', actors: '马修·麦康纳, 安妮·海瑟薇', genre: '科幻',
    releaseDate: '2014-11-07', rating: 9.4, description: '前NASA飞行员穿越虫洞寻找人类新家园，同时与女儿跨越时空的爱', duration: 169, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20hole%20wormhole%20space%20station%20cosmic%20dust%20sci-fi%20epic%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 8, title: '楚门的世界', director: '彼得·威尔', actors: '金·凯瑞, 劳拉·琳妮', genre: '剧情',
    releaseDate: '1998-06-05', rating: 9.3, description: '楚门从出生起就生活在一个巨大的摄影棚中，他的一切都是真人秀', duration: 103, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=man%20inside%20snow%20globe%20TV%20screen%20surveillance%20dome%20surreal%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 9, title: '忠犬八公的故事', director: '拉斯·霍尔斯道姆', actors: '理查·基尔, 萨拉·罗默尔', genre: '剧情',
    releaseDate: '2009-06-13', rating: 9.4, description: '秋田犬八公在主人去世后，每天到车站等待主人归来，一等就是九年', duration: 93, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=loyal%20dog%20waiting%20train%20station%20autumn%20leaves%20touching%20emotional%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 10, title: '三傻大闹宝莱坞', director: '拉吉库马尔·希拉尼', actors: '阿米尔·汗, 马德哈万', genre: '喜剧',
    releaseDate: '2009-12-25', rating: 9.2, description: '三个好友在印度顶尖工程学院的求学故事，反思教育制度', duration: 171, country: '印度',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=three%20friends%20college%20campus%20Indian%20comedy%20colorful%20joyful%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 11, title: '疯狂动物城', director: '拜伦·霍华德', actors: '金妮弗·古德温, 杰森·贝特曼', genre: '动画',
    releaseDate: '2016-03-04', rating: 9.2, description: '兔子朱迪成为动物城第一位兔子警官，与狐狸尼克搭档破案', duration: 108, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anthropomorphic%20animals%20city%20skyline%20fox%20and%20rabbit%20buddy%20cop%20colorful&image_size=portrait_4_3',
  },
  {
    id: 12, title: '寻梦环游记', director: '李·昂克里奇', actors: '安东尼·冈萨雷斯, 盖尔·加西亚', genre: '动画',
    releaseDate: '2017-11-22', rating: 9.1, description: '小男孩米格尔在亡灵节误入亡灵世界，寻找音乐梦想与家族秘密', duration: 105, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mexican%20day%20of%20dead%20skeleton%20guitar%20marigold%20bridge%20colorful%20magical&image_size=portrait_4_3',
  },
  {
    id: 13, title: '寄生虫', director: '奉俊昊', actors: '宋康昊, 李善均, 赵汝贞', genre: '剧情',
    releaseDate: '2019-05-30', rating: 8.8, description: '贫困家庭巧妙渗透进富裕家庭，揭示社会阶层的巨大鸿沟', duration: 132, country: '韩国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rich%20poor%20house%20contrast%20staircase%20Korean%20social%20drama%20dark%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 14, title: '你的名字', director: '新海诚', actors: '神木隆之介, 上白石萌音', genre: '动画',
    releaseDate: '2016-08-26', rating: 8.4, description: '乡村少女三叶与东京少年泷在梦中交换身体，跨越时空寻找彼此', duration: 106, country: '日本',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comet%20starry%20sky%20Japanese%20town%20romance%20anime%20ethereal%20beautiful&image_size=portrait_4_3',
  },
  {
    id: 15, title: '飞屋环游记', director: '彼特·道格特', actors: '爱德·阿斯纳, 乔丹·长井', genre: '动画',
    releaseDate: '2009-05-29', rating: 9.0, description: '78岁的卡尔用气球带着房子飞向南美洲，完成与妻子的约定', duration: 96, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=floating%20house%20balloons%20colorful%20sky%20adventure%20heartwarming%20pixar%20style&image_size=portrait_4_3',
  },
  {
    id: 16, title: '大话西游之大圣娶亲', director: '刘镇伟', actors: '周星驰, 朱茵, 莫文蔚', genre: '喜剧',
    releaseDate: '1995-02-04', rating: 9.2, description: '至尊宝为了救紫霞仙子戴上紧箍咒，从此不能再爱', duration: 99, country: '中国香港',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20mythology%20monkey%20king%20sunset%20desert%20romance%20fantasy%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 17, title: '辛德勒的列表', director: '史蒂文·斯皮尔伯格', actors: '连姆·尼森, 本·金斯利', genre: '剧情',
    releaseDate: '1993-12-15', rating: 9.5, description: '德国商人辛德勒在二战中倾家荡产拯救了一千多名犹太人', duration: 195, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20white%20girl%20red%20coat%20WW2%20Holocaust%20list%20dramatic%20historical&image_size=portrait_4_3',
  },
  {
    id: 18, title: '龙猫', director: '宫崎骏', actors: '日高法子, 的場未華子', genre: '动画',
    releaseDate: '1988-04-16', rating: 9.2, description: '两姐妹搬到乡下后遇到森林精灵龙猫，展开了一段温馨奇幻的冒险', duration: 86, country: '日本',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=giant%20friendly%20forest%20spirit%20countryside%20Japan%20magical%20anime%20gentle&image_size=portrait_4_3',
  },
  {
    id: 19, title: '无间道', director: '刘伟强', actors: '梁朝伟, 刘德华', genre: '犯罪',
    releaseDate: '2002-12-12', rating: 9.3, description: '警方和黑社会各自安插卧底，双线博弈的故事', duration: 101, country: '中国香港',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rooftop%20confrontation%20Hong%20Kong%20night%20undercover%20crime%20thriller%20noir&image_size=portrait_4_3',
  },
  {
    id: 20, title: '教父', director: '弗朗西斯·科波拉', actors: '马龙·白兰度, 阿尔·帕西诺', genre: '犯罪',
    releaseDate: '1972-03-24', rating: 9.3, description: '一个黑手党家族的传承故事，权力与家庭的纠葛', duration: 175, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mafia%20godfather%20dark%20office%20puppet%20strings%20crime%20epic%20vintage&image_size=portrait_4_3',
  },
  {
    id: 21, title: '看不见的客人', director: '奥里奥尔·保罗', actors: '马里奥·卡萨斯, 阿娜·瓦格纳', genre: '悬疑',
    releaseDate: '2017-01-06', rating: 8.8, description: '一个成功商人被指控谋杀，他的律师帮他准备辩护', duration: 106, country: '西班牙',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20hotel%20room%20mirror%20reflection%20mystery%20thriller%20Spanish%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 22, title: '怦然心动', director: '罗伯·莱纳', actors: '玛德琳·卡罗尔, 卡兰·麦克奥利菲', genre: '爱情',
    releaseDate: '2010-08-06', rating: 9.1, description: '两个青少年从不同视角讲述他们从二年级开始的恋爱故事', duration: 90, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20love%20sycamore%20tree%20sunset%20warm%20coming%20of%20age%20romantic%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 23, title: '拯救大兵瑞恩', director: '史蒂文·斯皮尔伯格', actors: '汤姆·汉克斯, 马特·达蒙', genre: '战争',
    releaseDate: '1998-07-24', rating: 9.1, description: '诺曼底登陆后，一支小分队深入敌后寻找一名士兵', duration: 169, country: '美国',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=WW2%20Normandy%20beach%20landing%20soldiers%20war%20drama%20cinematic%20epic&image_size=portrait_4_3',
  },
  {
    id: 24, title: '功夫', director: '周星驰', actors: '周星驰, 元华', genre: '动作',
    releaseDate: '2004-12-23', rating: 8.6, description: '一个小混混误入猪笼城寨，引发一系列武林高手现身', duration: 99, country: '中国香港',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20kung%20fu%20alley%20martial%20arts%20axe%20gang%20comedy%20action%20cinematic&image_size=portrait_4_3',
  },
  {
    id: 25, title: '指环王：王者归来', director: '彼得·杰克逊', actors: '伊利亚·伍德, 维果·莫腾森', genre: '奇幻',
    releaseDate: '2003-12-17', rating: 9.2, description: '弗罗多和山姆最终抵达末日火山，人类联军展开最后一战', duration: 201, country: '新西兰',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=epic%20fantasy%20battle%20castle%20mountain%20ring%20volcano%20medieval%20cinematic&image_size=portrait_4_3',
  },
];

const useMovieStore = create<MovieState>((set, get) => ({
  movies: mockMovies,
  currentMovie: null,
  filters: { ...defaultFilters },
  loading: false,

  fetchMovies: async () => {
    set({ loading: true });
    try {
      const { filters } = get();
      const params: any = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.genre) params.genre = filters.genre;
      const data: any = await request.get('/movies', { params });
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      if (list.length > 0) {
        set({ movies: list, loading: false });
      } else {
        set({ movies: filterMockMovies(filters), loading: false });
      }
    } catch {
      const { filters } = get();
      set({ movies: filterMockMovies(filters), loading: false });
    }
  },

  fetchMovieById: async (id) => {
    set({ loading: true });
    try {
      const data: any = await request.get(`/movies/${id}`);
      if (data.data) {
        set({ currentMovie: data.data, loading: false });
      } else {
        set({ currentMovie: mockMovies.find((m) => m.id === id) || null, loading: false });
      }
    } catch {
      set({ currentMovie: mockMovies.find((m) => m.id === id) || null, loading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },
}));

function filterMockMovies(filters: MovieFilters): Movie[] {
  let result = [...mockMovies];
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    result = result.filter(
      (m) => m.title.toLowerCase().includes(kw) || m.director.toLowerCase().includes(kw) || m.description.toLowerCase().includes(kw)
    );
  }
  if (filters.genre) {
    result = result.filter((m) => m.genre.includes(filters.genre));
  }
  return result;
}

export default useMovieStore;
