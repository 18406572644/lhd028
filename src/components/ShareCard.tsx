import { motion } from 'framer-motion';
import type { ShareItem } from '@/store/shareStore';

interface ShareCardProps {
  share: ShareItem;
}

export default function ShareCard({ share }: ShareCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-retro-brown border-2 border-retro-gold-dark rounded-lg overflow-hidden max-w-sm"
    >
      <div className="absolute left-0 top-0 bottom-0 film-perforations opacity-40" />
      <div className="absolute right-0 top-0 bottom-0 film-perforations opacity-40" />

      <div className="p-6 ml-3 mr-3">
        <div className="text-center mb-4 border-b border-dashed border-retro-gold-dark/50 pb-4">
          <p className="text-retro-gold-dark text-xs tracking-[0.3em] mb-1">CINEMA BLIND BOX</p>
          <h3 className="font-serif text-retro-cream text-xl">电影盲盒推荐</h3>
          <p className="text-retro-gold-dark text-xs mt-1">惊喜电影等你来开</p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🎬</div>
          <div className="flex-1">
            <p className="text-retro-cream text-sm">盲盒 #{share.blindBoxId}</p>
            <p className="text-retro-gold-dark text-xs mt-1">内含精选电影推荐</p>
          </div>
        </div>

        <div className="border-t border-dashed border-retro-gold-dark/50 pt-3 flex items-center justify-between">
          <div className="text-retro-gold-dark text-xs">
            <p>{share.createdAt}</p>
          </div>
          <div className="text-right">
            <p className="text-retro-gold-dark text-[10px] tracking-wider">NO.</p>
            <p className="font-display text-retro-gold text-sm tracking-wider">{share.shareCode}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
