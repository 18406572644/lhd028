import { create } from 'zustand';
import request from '@/utils/request';
import type { Movie } from './movieStore';

export interface MovieListItem {
  id: number;
  listId: number;
  movieId: number;
  sortOrder: number;
  tag: string;
  movie?: {
    id: number;
    title: string;
    posterUrl: string;
    rating: number;
    genre: string;
    year: number;
    director: string;
  };
}

export interface MovieListDetail {
  id: number;
  userId: number;
  title: string;
  description: string;
  cover: string;
  visibility: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
  items: MovieListItem[];
  movieCount: number;
  commentCount: number;
  collectionCount: number;
  isCollected: boolean;
  isOwner: boolean;
}

export interface ListComment {
  id: number;
  listId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
}

interface MovieListState {
  lists: MovieListDetail[];
  currentList: MovieListDetail | null;
  comments: ListComment[];
  collectedLists: MovieListDetail[];
  myLists: MovieListDetail[];
  total: number;
  page: number;
  loading: boolean;
  fetchPublicLists: (page?: number, size?: number, sort?: string, keyword?: string) => Promise<void>;
  fetchListDetail: (id: number) => Promise<void>;
  fetchMyLists: () => Promise<void>;
  fetchCollectedLists: () => Promise<void>;
  createList: (data: { title: string; description?: string; cover?: string; visibility?: string; items?: { movieId: number; sortOrder?: number; tag?: string }[] }) => Promise<MovieListDetail | null>;
  updateList: (id: number, data: { title?: string; description?: string; cover?: string; visibility?: string; items?: { movieId: number; sortOrder?: number; tag?: string }[] }) => Promise<MovieListDetail | null>;
  deleteList: (id: number) => Promise<boolean>;
  collectList: (id: number) => Promise<boolean>;
  uncollectList: (id: number) => Promise<boolean>;
  addComment: (listId: number, content: string) => Promise<void>;
  fetchComments: (listId: number, page?: number, size?: number) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  addMovieToList: (listId: number, movieId: number, sortOrder?: number, tag?: string) => Promise<boolean>;
  removeMovieFromList: (listId: number, movieId: number) => Promise<boolean>;
  generateYearReview: () => Promise<MovieListDetail | null>;
}

const mockUser = { id: 1, username: 'cinephile', nickname: '资深影迷', avatar: '' };

const mockMovies: Movie[] = [
  { id: 1, title: '肖申克的救赎', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prison%20bars%20with%20warm%20sunlight%20streaming%20through%2C%20hope%20and%20freedom%20cinematic%20poster%20dramatic%20lighting&image_size=portrait_4_3', director: '弗兰克·德拉邦特', actors: '蒂姆·罗宾斯, 摩根·弗里曼', genre: '剧情', releaseDate: '1994-09-23', rating: 9.7, description: '被冤枉的银行家安迪在肖申克监狱中用智慧和毅力赢得自由与尊严', duration: 142, country: '美国' },
  { id: 2, title: '霸王别姬', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20opera%20stage%20dramatic%20face%20paint%20tragedy%20cinematic%20vintage&image_size=portrait_4_3', director: '陈凯歌', actors: '张国荣, 张丰毅, 巩俐', genre: '剧情', releaseDate: '1993-01-12', rating: 9.6, description: '程蝶衣一生痴戏，从一而终', duration: 171, country: '中国' },
  { id: 5, title: '千与千寻', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bathhouse%20spirit%20world%20magical%20night%20lanterns%20anime%20style%20ethereal&image_size=portrait_4_3', director: '宫崎骏', actors: '柊瑠美, 入野自由', genre: '动画', releaseDate: '2001-07-20', rating: 9.4, description: '少女千寻误入神灵世界', duration: 125, country: '日本' },
  { id: 6, title: '盗梦空间', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20city%20architecture%20dream%20layers%20surreal%20sci-fi%20thriller%20cinematic&image_size=portrait_4_3', director: '克里斯托弗·诺兰', actors: '莱昂纳多·迪卡普里奥, 渡边谦', genre: '科幻', releaseDate: '2010-07-16', rating: 9.3, description: '造梦师柯布深入梦境执行任务', duration: 148, country: '美国' },
  { id: 7, title: '星际穿越', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20hole%20wormhole%20space%20station%20cosmic%20dust%20sci-fi%20epic%20cinematic&image_size=portrait_4_3', director: '克里斯托弗·诺兰', actors: '马修·麦康纳, 安妮·海瑟薇', genre: '科幻', releaseDate: '2014-11-07', rating: 9.4, description: '穿越虫洞寻找人类新家园', duration: 169, country: '美国' },
  { id: 12, title: '寻梦环游记', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mexican%20day%20of%20dead%20skeleton%20guitar%20marigold%20bridge%20colorful%20magical&image_size=portrait_4_3', director: '李·昂克里奇', actors: '安东尼·冈萨雷斯', genre: '动画', releaseDate: '2017-11-22', rating: 9.1, description: '亡灵节误入亡灵世界', duration: 105, country: '美国' },
  { id: 16, title: '大话西游之大圣娶亲', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20mythology%20monkey%20king%20sunset%20desert%20romance%20fantasy%20cinematic&image_size=portrait_4_3', director: '刘镇伟', actors: '周星驰, 朱茵', genre: '喜剧', releaseDate: '1995-02-04', rating: 9.2, description: '至尊宝戴上紧箍咒', duration: 99, country: '中国香港' },
  { id: 19, title: '无间道', poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rooftop%20confrontation%20Hong%20Kong%20night%20undercover%20crime%20thriller%20noir&image_size=portrait_4_3', director: '刘伟强', actors: '梁朝伟, 刘德华', genre: '犯罪', releaseDate: '2002-12-12', rating: 9.3, description: '双线博弈的卧底故事', duration: 101, country: '中国香港' },
];

function movieToListItem(movie: Movie, listId: number, sortOrder: number, tag?: string): MovieListItem {
  return {
    id: sortOrder + 1,
    listId,
    movieId: movie.id,
    sortOrder,
    tag: tag || '',
    movie: {
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster,
      rating: movie.rating,
      genre: movie.genre,
      year: parseInt(movie.releaseDate.split('-')[0]),
      director: movie.director,
    },
  };
}

const mockLists: MovieListDetail[] = [
  {
    id: 1, userId: 1, title: '年度十佳科幻', description: '那些让人脑洞大开的科幻神作，每一部都值得反复品味', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folding%20city%20architecture%20dream%20layers%20surreal%20sci-fi%20thriller%20cinematic&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-12-01 10:00:00', user: mockUser,
    items: [movieToListItem(mockMovies[3], 1, 0, '封神之作'), movieToListItem(mockMovies[4], 1, 1, '视觉盛宴'), movieToListItem(mockMovies[2], 1, 2)],
    movieCount: 3, commentCount: 12, collectionCount: 28, isCollected: false, isOwner: false,
  },
  {
    id: 2, userId: 1, title: '周末治愈片单', description: '适合周末窝在沙发上看的温暖电影，看完心情变好', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bathhouse%20spirit%20world%20magical%20night%20lanterns%20anime%20style%20ethereal&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-11-20 15:30:00', user: mockUser,
    items: [movieToListItem(mockMovies[2], 2, 0, '治愈神片'), movieToListItem(mockMovies[5], 2, 1, '哭到失声'), movieToListItem(mockMovies[6], 2, 2, '笑到停不下来'), movieToListItem(mockMovies[0], 2, 3)],
    movieCount: 4, commentCount: 8, collectionCount: 35, isCollected: true, isOwner: false,
  },
  {
    id: 3, userId: 1, title: '一个人在深夜看的电影', description: '夜深人静时，一个人慢慢品味的电影，有些孤独有些美', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rooftop%20confrontation%20Hong%20Kong%20night%20undercover%20crime%20thriller%20noir&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-11-15 23:00:00', user: mockUser,
    items: [movieToListItem(mockMovies[7], 3, 0, '看完沉默'), movieToListItem(mockMovies[1], 3, 1, '意难平'), movieToListItem(mockMovies[3], 3, 2)],
    movieCount: 3, commentCount: 21, collectionCount: 42, isCollected: false, isOwner: false,
  },
  {
    id: 4, userId: 2, title: '宫崎骏动画世界', description: '永远相信宫崎骏，永远被治愈', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bathhouse%20spirit%20world%20magical%20night%20lanterns%20anime%20style%20ethereal&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-10-28 09:15:00', user: { id: 2, username: 'ghibli_fan', nickname: '吉卜力铁粉', avatar: '' },
    items: [movieToListItem(mockMovies[2], 4, 0, '封神之作'), movieToListItem(mockMovies[5], 4, 1, '治愈神片')],
    movieCount: 2, commentCount: 5, collectionCount: 18, isCollected: false, isOwner: false,
  },
  {
    id: 5, userId: 2, title: '高分犯罪悬疑必看', description: '智商在线的犯罪悬疑片，不到最后猜不到结局', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rooftop%20confrontation%20Hong%20Kong%20night%20undercover%20crime%20thriller%20noir&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-10-10 20:45:00', user: { id: 2, username: 'ghibli_fan', nickname: '吉卜力铁粉', avatar: '' },
    items: [movieToListItem(mockMovies[7], 5, 0, '演技炸裂'), movieToListItem(mockMovies[3], 5, 1, '反转惊喜')],
    movieCount: 2, commentCount: 15, collectionCount: 22, isCollected: false, isOwner: false,
  },
  {
    id: 6, userId: 1, title: '我的年度观影回顾', description: '2025年看过的精选电影，共观看了 38 部电影', cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prison%20bars%20with%20warm%20sunlight%20streaming%20through%2C%20hope%20and%20freedom%20cinematic%20poster%20dramatic%20lighting&image_size=portrait_4_3',
    visibility: 'PUBLIC', createdAt: '2025-12-31 00:00:00', user: mockUser,
    items: [movieToListItem(mockMovies[0], 6, 0), movieToListItem(mockMovies[1], 6, 1), movieToListItem(mockMovies[4], 6, 2), movieToListItem(mockMovies[6], 6, 3)],
    movieCount: 4, commentCount: 3, collectionCount: 10, isCollected: false, isOwner: false,
  },
];

const mockComments: ListComment[] = [
  { id: 1, listId: 1, userId: 2, content: '科幻迷必看！盗梦空间和星际穿越太绝了', createdAt: '2025-12-02 14:30:00', user: { id: 2, username: 'ghibli_fan', nickname: '吉卜力铁粉', avatar: '' } },
  { id: 2, listId: 1, userId: 3, content: '星际穿越看了三遍，每次都哭', createdAt: '2025-12-03 09:15:00', user: { id: 3, username: 'movie_worm', nickname: '观影小虫', avatar: '' } },
  { id: 3, listId: 2, userId: 3, content: '千与千寻真的治愈', createdAt: '2025-11-21 16:20:00', user: { id: 3, username: 'movie_worm', nickname: '观影小虫', avatar: '' } },
  { id: 4, listId: 3, userId: 2, content: '深夜看霸王别姬，哭了', createdAt: '2025-11-16 01:30:00', user: { id: 2, username: 'ghibli_fan', nickname: '吉卜力铁粉', avatar: '' } },
  { id: 5, listId: 3, userId: 4, content: '无间道真的是港片巅峰', createdAt: '2025-11-17 11:00:00', user: { id: 4, username: 'hk_cinema', nickname: '港片爱好者', avatar: '' } },
];

let nextListId = 100;
let nextCommentId = 100;

const localLists: MovieListDetail[] = [];
const localComments: ListComment[] = [];

function getAllMockLists(): MovieListDetail[] {
  return [...mockLists, ...localLists];
}

function findListById(id: number): MovieListDetail | undefined {
  return getAllMockLists().find((l) => l.id === id);
}

function getAllMockComments(): ListComment[] {
  return [...mockComments, ...localComments];
}

const useMovieListStore = create<MovieListState>((set, get) => ({
  lists: mockLists,
  currentList: null,
  comments: [],
  collectedLists: [],
  myLists: [],
  total: mockLists.length,
  page: 1,
  loading: false,

  fetchPublicLists: async (page = 1, size = 12, sort = 'latest', keyword) => {
    set({ loading: true });
    try {
      const params: any = { page, size, sort };
      if (keyword) params.keyword = keyword;
      const data: any = await request.get('/lists', { params });
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      if (list.length > 0) {
        set({
          lists: list,
          total: rawData?.total || list.length,
          page: rawData?.page || page,
          loading: false,
        });
        return;
      }
    } catch {}
    let filtered = [...getAllMockLists()];
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (l) => l.title.toLowerCase().includes(kw) || (l.description || '').toLowerCase().includes(kw) || (l.user?.nickname || '').toLowerCase().includes(kw)
      );
    }
    if (sort === 'hot') {
      filtered.sort((a, b) => (b.collectionCount + b.commentCount) - (a.collectionCount + a.commentCount));
    } else if (sort === 'comments') {
      filtered.sort((a, b) => b.commentCount - a.commentCount);
    }
    const start = (page - 1) * size;
    const paged = filtered.slice(start, start + size);
    set({
      lists: paged,
      total: filtered.length,
      page,
      loading: false,
    });
  },

  fetchListDetail: async (id) => {
    set({ loading: true });
    try {
      const data: any = await request.get(`/lists/${id}`);
      if (data.data) {
        set({ currentList: data.data, loading: false });
        return;
      }
    } catch {}
    const found = findListById(id);
    set({ currentList: found || null, loading: false });
  },

  fetchMyLists: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/lists/my');
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      if (list.length > 0) {
        set({ myLists: list, loading: false });
        return;
      }
    } catch {}
    set({ myLists: localLists.length > 0 ? localLists : [], loading: false });
  },

  fetchCollectedLists: async () => {
    set({ loading: true });
    try {
      const data: any = await request.get('/lists/collected');
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      if (list.length > 0) {
        set({ collectedLists: list, loading: false });
        return;
      }
    } catch {}
    set({ collectedLists: mockLists.filter((l) => l.isCollected), loading: false });
  },

  createList: async (data) => {
    try {
      const res: any = await request.post('/lists', data);
      if (res.data) {
        const newList = res.data;
        set((state) => ({ myLists: [newList, ...state.myLists] }));
        return newList;
      }
    } catch {}
    const newId = ++nextListId;
    const items: MovieListItem[] = (data.items || []).map((itemData, idx) => {
      const movie = mockMovies.find((m) => m.id === itemData.movieId);
      return movieToListItem(movie || mockMovies[0], newId, idx, itemData.tag);
    });
    const newList: MovieListDetail = {
      id: newId,
      userId: 1,
      title: data.title,
      description: data.description || '',
      cover: data.cover || (items[0]?.movie?.posterUrl || ''),
      visibility: data.visibility || 'PUBLIC',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: mockUser,
      items,
      movieCount: items.length,
      commentCount: 0,
      collectionCount: 0,
      isCollected: false,
      isOwner: true,
    };
    localLists.unshift(newList);
    set((state) => ({
      myLists: [newList, ...state.myLists],
      lists: [newList, ...state.lists],
      currentList: newList,
    }));
    return newList;
  },

  updateList: async (id, data) => {
    try {
      const res: any = await request.put(`/lists/${id}`, data);
      if (res.data) {
        set({ currentList: res.data });
        return res.data;
      }
    } catch {}
    const existing = findListById(id);
    if (!existing) return null;
    const items: MovieListItem[] = (data.items || []).map((itemData, idx) => {
      const movie = mockMovies.find((m) => m.id === itemData.movieId);
      return movieToListItem(movie || mockMovies[0], id, idx, itemData.tag);
    });
    const updated: MovieListDetail = {
      ...existing,
      title: data.title || existing.title,
      description: data.description ?? existing.description,
      cover: data.cover ?? existing.cover,
      visibility: data.visibility || existing.visibility,
      items,
      movieCount: items.length,
    };
    const idx = localLists.findIndex((l) => l.id === id);
    if (idx >= 0) localLists[idx] = updated;
    set({ currentList: updated });
    return updated;
  },

  deleteList: async (id) => {
    try {
      await request.delete(`/lists/${id}`);
      set((state) => ({
        myLists: state.myLists.filter((l) => l.id !== id),
        lists: state.lists.filter((l) => l.id !== id),
        currentList: state.currentList?.id === id ? null : state.currentList,
      }));
      return true;
    } catch {}
    const li = localLists.findIndex((l) => l.id === id);
    if (li >= 0) localLists.splice(li, 1);
    set((state) => ({
      myLists: state.myLists.filter((l) => l.id !== id),
      lists: state.lists.filter((l) => l.id !== id),
      currentList: state.currentList?.id === id ? null : state.currentList,
    }));
    return true;
  },

  collectList: async (id) => {
    try {
      await request.post(`/lists/${id}/collect`);
      set((state) => {
        const updateList = (lists: MovieListDetail[]) =>
          lists.map((l) => (l.id === id ? { ...l, isCollected: true, collectionCount: l.collectionCount + 1 } : l));
        return {
          lists: updateList(state.lists),
          currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: true, collectionCount: state.currentList.collectionCount + 1 } : state.currentList,
        };
      });
      return true;
    } catch {}
    set((state) => {
      const updateList = (lists: MovieListDetail[]) =>
        lists.map((l) => (l.id === id ? { ...l, isCollected: true, collectionCount: l.collectionCount + 1 } : l));
      return {
        lists: updateList(state.lists),
        currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: true, collectionCount: state.currentList.collectionCount + 1 } : state.currentList,
        collectedLists: state.currentList?.id === id ? [{ ...state.currentList, isCollected: true, collectionCount: state.currentList.collectionCount + 1 }, ...state.collectedLists] : state.collectedLists,
      };
    });
    return true;
  },

  uncollectList: async (id) => {
    try {
      await request.delete(`/lists/${id}/collect`);
      set((state) => {
        const updateList = (lists: MovieListDetail[]) =>
          lists.map((l) => (l.id === id ? { ...l, isCollected: false, collectionCount: Math.max(0, l.collectionCount - 1) } : l));
        return {
          lists: updateList(state.lists),
          currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: false, collectionCount: Math.max(0, state.currentList.collectionCount - 1) } : state.currentList,
          collectedLists: state.collectedLists.filter((l) => l.id !== id),
        };
      });
      return true;
    } catch {}
    set((state) => {
      const updateList = (lists: MovieListDetail[]) =>
        lists.map((l) => (l.id === id ? { ...l, isCollected: false, collectionCount: Math.max(0, l.collectionCount - 1) } : l));
      return {
        lists: updateList(state.lists),
        currentList: state.currentList?.id === id ? { ...state.currentList, isCollected: false, collectionCount: Math.max(0, state.currentList.collectionCount - 1) } : state.currentList,
        collectedLists: state.collectedLists.filter((l) => l.id !== id),
      };
    });
    return true;
  },

  addComment: async (listId, content) => {
    try {
      await request.post(`/lists/${listId}/comments`, { listId, content });
      get().fetchComments(listId);
      set((state) => {
        if (state.currentList?.id === listId) {
          return { currentList: { ...state.currentList, commentCount: state.currentList.commentCount + 1 } };
        }
        return {};
      });
      return;
    } catch {}
    const newComment: ListComment = {
      id: ++nextCommentId,
      listId,
      userId: 1,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: mockUser,
    };
    localComments.push(newComment);
    set((state) => ({
      comments: [newComment, ...state.comments],
      currentList: state.currentList?.id === listId ? { ...state.currentList, commentCount: state.currentList.commentCount + 1 } : state.currentList,
    }));
  },

  fetchComments: async (listId, _page = 1, _size = 10) => {
    try {
      const data: any = await request.get(`/lists/${listId}/comments`, { params: { page: _page, size: _size } });
      const rawData = data.data;
      const list = Array.isArray(rawData?.list) ? rawData.list : [];
      if (list.length > 0) {
        set({ comments: list });
        return;
      }
    } catch {}
    set({ comments: getAllMockComments().filter((c) => c.listId === listId) });
  },

  deleteComment: async (commentId) => {
    try {
      await request.delete(`/lists/comments/${commentId}`);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
      }));
      return;
    } catch {}
    const ci = localComments.findIndex((c) => c.id === commentId);
    if (ci >= 0) localComments.splice(ci, 1);
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
    }));
  },

  addMovieToList: async (listId, movieId, sortOrder, tag) => {
    try {
      await request.post(`/lists/${listId}/movies`, { movieId, sortOrder, tag });
      get().fetchListDetail(listId);
      return true;
    } catch {}
    const list = findListById(listId);
    if (!list) return false;
    const movie = mockMovies.find((m) => m.id === movieId);
    if (!movie) return false;
    const newItem = movieToListItem(movie, listId, list.items.length, tag);
    list.items.push(newItem);
    list.movieCount = list.items.length;
    set({ currentList: { ...list } });
    return true;
  },

  removeMovieFromList: async (listId, movieId) => {
    try {
      await request.delete(`/lists/${listId}/movies/${movieId}`);
      get().fetchListDetail(listId);
      return true;
    } catch {}
    const list = findListById(listId);
    if (!list) return false;
    list.items = list.items.filter((i) => i.movieId !== movieId);
    list.movieCount = list.items.length;
    set({ currentList: { ...list } });
    return true;
  },

  generateYearReview: async () => {
    try {
      const res: any = await request.post('/lists/year-review');
      if (res.data) return res.data;
    } catch {}
    const year = new Date().getFullYear();
    const reviewList: MovieListDetail = {
      id: ++nextListId,
      userId: 1,
      title: `${year} 年度观影回顾`,
      description: `基于你的观影记录自动生成的年度回顾片单，共观看了 ${mockMovies.length} 部电影`,
      cover: mockMovies[0].poster,
      visibility: 'PUBLIC',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: mockUser,
      items: mockMovies.slice(0, 5).map((m, i) => movieToListItem(m, nextListId, i)),
      movieCount: 5,
      commentCount: 0,
      collectionCount: 0,
      isCollected: false,
      isOwner: true,
    };
    localLists.unshift(reviewList);
    return reviewList;
  },
}));

export default useMovieListStore;
