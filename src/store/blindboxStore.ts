import { create } from 'zustand';
import request from '@/utils/request';
import type { Movie } from './movieStore';

export type Rarity = 'common' | 'rare' | 'legendary';

export interface BlindBox {
  blindboxId: number;
  movies: Movie[];
  createdAt: string;
  collected: boolean;
  rarities: Rarity[];
}

interface BlindBoxPreferences {
  genres: string[];
  yearRange: [number, number];
  minRating: number;
}

interface BlindBoxState {
  currentBox: BlindBox | null;
  myBlindboxes: BlindBox[];
  collections: BlindBox[];
  preferences: BlindBoxPreferences;
  generating: boolean;
  loading: boolean;
  generateBlindBox: () => Promise<void>;
  collectBlindBox: (id: number) => Promise<void>;
  fetchMyBlindboxes: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  setPreferences: (prefs: Partial<BlindBoxPreferences>) => void;
}

const mockMovies: (Movie & { rarity: Rarity })[] = [
  {
    id: 1, title: '肖申克的救赎', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prison%20bars%20with%20warm%20sunlight%20streaming%20through%2C%20hope%20and%20freedom%20cinematic%20poster%20dramatic%20lighting&image_size=portrait_4_3',
    director: '弗兰克·德拉邦特', actors: '蒂姆·罗宾斯, 摩根·弗里曼', genre: '剧情',
    releaseDate: '1994-09-23', rating: 9.7, description: '两个被囚禁的男人在多年间找到了慰藉和最终的救赎。', duration: 142, country: '美国', rarity: 'legendary',
  },
  {
    id: 2, title: '千与千寻', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bathhouse%20spirit%20world%20magical%20night%20lanterns%20anime%20style%20ethereal&image_size=portrait_4_3',
    director: '宫崎骏', actors: '柊瑠美, 入野自由', genre: '动画',
    releaseDate: '2001-07-20', rating: 9.4, description: '少女千寻误入神灵世界，为了救父母而展开冒险。', duration: 125, country: '日本', rarity: 'legendary',
  },
  {
    id: 3, title: '盗梦空间', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20city%20architecture%20dream%20layers%20surreal%20sci-fi%20thriller%20cinematic&image_size=portrait_4_3',
    director: '克里斯托弗·诺兰', actors: '莱昂纳多·迪卡普里奥, 渡边谦', genre: '科幻',
    releaseDate: '2010-07-16', rating: 9.3, description: '一个通过梦境入侵他人潜意识的盗贼，接受了一个不可能的任务。', duration: 148, country: '美国', rarity: 'rare',
  },
  {
    id: 4, title: '大话西游之大圣娶亲', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20mythology%20monkey%20king%20sunset%20desert%20romance%20fantasy%20cinematic&image_size=portrait_4_3',
    director: '刘镇伟', actors: '周星驰, 朱茵', genre: '喜剧',
    releaseDate: '1995-02-04', rating: 9.2, description: '至尊宝为了救白骨精而穿越时空，最终发现自己就是孙悟空。', duration: 99, country: '中国香港', rarity: 'legendary',
  },
  {
    id: 5, title: '星际穿越', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20hole%20wormhole%20space%20station%20cosmic%20dust%20sci-fi%20epic%20cinematic&image_size=portrait_4_3',
    director: '克里斯托弗·诺兰', actors: '马修·麦康纳, 安妮·海瑟薇', genre: '科幻',
    releaseDate: '2014-11-07', rating: 9.4, description: '一队探险家利用虫洞穿越时空，为人类寻找新家园。', duration: 169, country: '美国', rarity: 'rare',
  },
  {
    id: 6, title: '看不见的客人', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20hotel%20room%20mirror%20reflection%20mystery%20thriller%20Spanish%20cinematic&image_size=portrait_4_3',
    director: '奥里奥尔·保罗', actors: '马里奥·卡萨斯, 阿娜·瓦格纳', genre: '悬疑',
    releaseDate: '2017-01-06', rating: 8.8, description: '一个成功商人被指控谋杀，他的律师帮他准备辩护。', duration: 106, country: '西班牙', rarity: 'rare',
  },
  {
    id: 7, title: '怦然心动', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20love%20sycamore%20tree%20sunset%20warm%20coming%20of%20age%20romantic%20cinematic&image_size=portrait_4_3',
    director: '罗伯·莱纳', actors: '玛德琳·卡罗尔, 卡兰·麦克奥利菲', genre: '爱情',
    releaseDate: '2010-08-06', rating: 9.1, description: '两个青少年从不同视角讲述他们从二年级开始的恋爱故事。', duration: 90, country: '美国', rarity: 'common',
  },
  {
    id: 8, title: '疯狂动物城', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anthropomorphic%20animals%20city%20skyline%20fox%20and%20rabbit%20buddy%20cop%20colorful&image_size=portrait_4_3',
    director: '拜伦·霍华德', actors: '金妮弗·古德温, 杰森·贝特曼', genre: '动画',
    releaseDate: '2016-03-04', rating: 9.2, description: '一只兔子警官和一只狐狸骗子联手破案。', duration: 108, country: '美国', rarity: 'common',
  },
  {
    id: 9, title: '拯救大兵瑞恩', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=WW2%20Normandy%20beach%20landing%20soldiers%20war%20drama%20cinematic%20epic&image_size=portrait_4_3',
    director: '史蒂文·斯皮尔伯格', actors: '汤姆·汉克斯, 马特·达蒙', genre: '战争',
    releaseDate: '1998-07-24', rating: 9.1, description: '诺曼底登陆后，一支小分队深入敌后寻找一名士兵。', duration: 169, country: '美国', rarity: 'common',
  },
  {
    id: 10, title: '教父', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mafia%20godfather%20dark%20office%20puppet%20strings%20crime%20epic%20vintage&image_size=portrait_4_3',
    director: '弗朗西斯·科波拉', actors: '马龙·白兰度, 阿尔·帕西诺', genre: '犯罪',
    releaseDate: '1972-03-24', rating: 9.3, description: '一个黑手党家族的传承故事，权力与家庭的纠葛。', duration: 175, country: '美国', rarity: 'rare',
  },
  {
    id: 11, title: '指环王：王者归来', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=epic%20fantasy%20battle%20castle%20mountain%20ring%20volcano%20medieval%20cinematic&image_size=portrait_4_3',
    director: '彼得·杰克逊', actors: '伊利亚·伍德, 维果·莫腾森', genre: '奇幻',
    releaseDate: '2003-12-17', rating: 9.2, description: '弗罗多和山姆最终抵达末日火山，人类联军展开最后一战。', duration: 201, country: '新西兰', rarity: 'rare',
  },
  {
    id: 12, title: '釜山行', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=zombie%20apocalypse%20train%20survivors%20horror%20action%20Korean%20cinematic&image_size=portrait_4_3',
    director: '延尚昊', actors: '孔侑, 郑有美', genre: '恐怖',
    releaseDate: '2016-07-20', rating: 8.6, description: '一列开往釜山的列车上爆发了丧尸危机，乘客们为生存而战。', duration: 118, country: '韩国', rarity: 'common',
  },
  {
    id: 13, title: '地球脉动', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=planet%20earth%20aerial%20nature%20mountains%20oceans%20wildlife%20documentary%20stunning&image_size=portrait_4_3',
    director: '大卫·爱登堡', actors: '大卫·爱登堡', genre: '纪录片',
    releaseDate: '2006-03-05', rating: 9.7, description: '从南极到北极，从赤道到寒带，展现地球上绝美的自然奇观。', duration: 550, country: '英国', rarity: 'common',
  },
  {
    id: 14, title: '你的名字', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comet%20starry%20sky%20Japanese%20town%20romance%20anime%20ethereal%20beautiful&image_size=portrait_4_3',
    director: '新海诚', actors: '神木隆之介, 上白石萌音', genre: '动画',
    releaseDate: '2016-08-26', rating: 8.4, description: '两个素未谋面的少年少女，在梦中交换身体。', duration: 106, country: '日本', rarity: 'common',
  },
  {
    id: 15, title: '低俗小说', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=neo-noir%20diner%20dance%20suit%20gun%20tarantino%20retro%20cinematic%20gritty&image_size=portrait_4_3',
    director: '昆汀·塔伦蒂诺', actors: '约翰·特拉沃尔塔, 塞缪尔·杰克逊', genre: '犯罪',
    releaseDate: '1994-10-14', rating: 8.8, description: '几条看似无关的故事线最终交织在一起的犯罪传奇。', duration: 154, country: '美国', rarity: 'rare',
  },
  {
    id: 16, title: '寄生虫', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rich%20poor%20house%20contrast%20staircase%20Korean%20social%20drama%20dark%20cinematic&image_size=portrait_4_3',
    director: '奉俊昊', actors: '宋康昊, 李善均', genre: '剧情',
    releaseDate: '2019-05-30', rating: 8.7, description: '一个贫穷家庭逐渐渗透进一个富裕家庭的生活。', duration: 132, country: '韩国', rarity: 'legendary',
  },
  {
    id: 17, title: '楚门的世界', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=man%20inside%20snow%20globe%20TV%20screen%20surveillance%20dome%20surreal%20cinematic&image_size=portrait_4_3',
    director: '彼得·威尔', actors: '金·凯瑞', genre: '剧情',
    releaseDate: '1998-06-05', rating: 9.3, description: '一个普通人逐渐发现自己的一生都是一场真人秀。', duration: 103, country: '美国', rarity: 'legendary',
  },
  {
    id: 18, title: '功夫', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20kung%20fu%20alley%20martial%20arts%20axe%20gang%20comedy%20action%20cinematic&image_size=portrait_4_3',
    director: '周星驰', actors: '周星驰, 元华', genre: '动作',
    releaseDate: '2004-12-23', rating: 8.6, description: '一个小混混误入猪笼城寨，引发一系列武林高手现身。', duration: 99, country: '中国香港', rarity: 'common',
  },
  {
    id: 19, title: '海上钢琴师', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20liner%20grand%20piano%20vintage%20ship%20music%20melancholic%20cinematic&image_size=portrait_4_3',
    director: '朱塞佩·托纳多雷', actors: '蒂姆·罗斯', genre: '剧情',
    releaseDate: '1998-10-28', rating: 9.3, description: '一个在船上出生的天才钢琴师，一生从未踏足陆地。', duration: 165, country: '意大利', rarity: 'rare',
  },
  {
    id: 20, title: '天气之子', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rainy%20Tokyo%20sky%20clearing%20sunshine%20anime%20romance%20magical&image_size=portrait_4_3',
    director: '新海诚', actors: '�的�的�的花, 森七菜', genre: '动画',
    releaseDate: '2019-07-19', rating: 7.9, description: '一个拥有操控天气能力的少女和一个离家出走的少年。', duration: 112, country: '日本', rarity: 'common',
  },
  {
    id: 21, title: '无间道', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rooftop%20confrontation%20Hong%20Kong%20night%20undercover%20crime%20thriller%20noir&image_size=portrait_4_3',
    director: '刘伟强', actors: '梁朝伟, 刘德华', genre: '犯罪',
    releaseDate: '2002-12-12', rating: 9.3, description: '警方和黑社会各自安插卧底，双线博弈的故事。', duration: 101, country: '中国香港', rarity: 'legendary',
  },
  {
    id: 22, title: '阿甘正传', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=park%20bench%20feather%20running%20American%20flag%20heartwarming%20cinematic&image_size=portrait_4_3',
    director: '罗伯特·泽米吉斯', actors: '汤姆·汉克斯', genre: '剧情',
    releaseDate: '1994-07-06', rating: 9.5, description: '一个智商只有75的男人，却创造了不可思议的人生。', duration: 142, country: '美国', rarity: 'rare',
  },
  {
    id: 23, title: '功夫熊猫', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=panda%20martial%20arts%20dragon%20warrior%20Chinese%20temple%20animated%20comedy&image_size=portrait_4_3',
    director: '马克·奥斯本', actors: '杰克·布莱克', genre: '动画',
    releaseDate: '2008-06-06', rating: 8.2, description: '一只懒散的熊猫意外被选为龙之武士，踏上功夫之路。', duration: 92, country: '美国', rarity: 'common',
  },
  {
    id: 24, title: '闪灵', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=overlook%20hotel%20twins%20hallway%20axe%20door%20horror%20Kubrick%20iconic&image_size=portrait_4_3',
    director: '斯坦利·库布里克', actors: '杰克·尼科尔森', genre: '恐怖',
    releaseDate: '1980-05-23', rating: 8.5, description: '一个作家带着家人住进偏僻酒店，逐渐陷入疯狂。', duration: 146, country: '美国', rarity: 'rare',
  },
  {
    id: 25, title: '龙猫', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=giant%20friendly%20forest%20spirit%20countryside%20Japan%20magical%20anime%20gentle&image_size=portrait_4_3',
    director: '宫崎骏', actors: '日高法子, �的場未華子', genre: '动画',
    releaseDate: '1988-04-16', rating: 9.2, description: '两姐妹在乡间遇到了神奇的森林精灵龙猫。', duration: 86, country: '日本', rarity: 'common',
  },
];

function calculateRarity(movie: Movie): Rarity {
  if (movie.rating >= 9.2) return 'legendary';
  if (movie.rating >= 8.7) return 'rare';
  return 'common';
}

let boxIdCounter = Date.now();

const useBlindboxStore = create<BlindBoxState>((set, get) => ({
  currentBox: null,
  myBlindboxes: [],
  collections: [],
  preferences: { genres: [], yearRange: [1990, 2025], minRating: 0 },
  generating: false,
  loading: false,

  generateBlindBox: async () => {
    set({ generating: true, currentBox: null });
    try {
      const { preferences } = get();

      let candidates = mockMovies.filter((m) => {
        const year = parseInt(m.releaseDate.split('-')[0]);
        if (year < preferences.yearRange[0] || year > preferences.yearRange[1]) return false;
        if (preferences.minRating > 0 && m.rating < preferences.minRating) return false;
        if (preferences.genres.length > 0 && !preferences.genres.includes(m.genre)) return false;
        return true;
      });

      if (candidates.length === 0) {
        candidates = [...mockMovies];
      }

      const shuffled = candidates.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);
      const rarities = selected.map((m) => m.rarity || calculateRarity(m));
      const movies: Movie[] = selected.map(({ rarity, ...rest }) => rest);

      await new Promise((resolve) => setTimeout(resolve, 800));

      set({
        currentBox: {
          blindboxId: ++boxIdCounter,
          movies,
          createdAt: new Date().toISOString().split('T')[0],
          collected: false,
          rarities,
        },
        generating: false,
      });
    } catch {
      set({ generating: false });
    }
  },

  collectBlindBox: async (id) => {
    try {
      await request.post(`/blindbox/${id}/collect`);
      set((state) => ({
        currentBox: state.currentBox ? { ...state.currentBox, collected: true } : null,
        collections: state.collections.map((b) => (b.blindboxId === id ? { ...b, collected: true } : b)),
      }));
    } catch {
      set((state) => ({
        currentBox: state.currentBox ? { ...state.currentBox, collected: true } : null,
      }));
    }
  },

  fetchMyBlindboxes: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/blindbox/my');
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      set({ myBlindboxes: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCollections: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/blindbox/collections');
      const rawData = data.data;
      const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.list) ? rawData.list : [];
      set({ collections: list, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setPreferences: (prefs) => {
    set((state) => ({ preferences: { ...state.preferences, ...prefs } }));
  },
}));

export default useBlindboxStore;
