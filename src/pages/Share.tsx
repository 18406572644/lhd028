import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Empty, Spin, message } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useShareStore from '@/store/shareStore';
import ShareCard from '@/components/ShareCard';

export default function Share() {
  const navigate = useNavigate();
  const { myShares, loading, createShare, deleteShare } = useShareStore();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [blindBoxId, setBlindBoxId] = useState('');

  const handleCreateShare = async () => {
    if (!blindBoxId) {
      message.warning('请输入盲盒ID');
      return;
    }
    const code = await createShare(Number(blindBoxId));
    if (code) {
      message.success(`分享成功，分享码: ${code}`);
      setShareModalOpen(false);
      setBlindBoxId('');
    }
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${code}`);
    message.success('链接已复制');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-retro-cream text-2xl">好友分享</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShareModalOpen(true)}
        >
          创建分享
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spin size="large" /></div>
      ) : myShares.length === 0 ? (
        <div className="retro-card rounded-xl p-12 text-center">
          <Empty description={<span className="text-retro-cream-dark">暂无分享记录</span>} />
          <Button type="primary" className="mt-4" onClick={() => setShareModalOpen(true)}>
            创建第一个分享
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myShares.map((share, i) => (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <ShareCard share={share} />
              <div className="flex gap-2 mt-3 justify-center">
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyLink(share.shareCode)}
                  className="!text-retro-gold-dark !border-retro-gold-dark/50"
                >
                  复制链接
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteShare(share.id)}
                >
                  删除
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={shareModalOpen}
        title={<span className="text-retro-gold font-serif">创建分享</span>}
        onCancel={() => setShareModalOpen(false)}
        onOk={handleCreateShare}
        okText="分享"
        cancelText="取消"
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-retro-cream-dark text-sm mb-1 block">盲盒ID</label>
            <Input
              value={blindBoxId}
              onChange={(e) => setBlindBoxId(e.target.value)}
              placeholder="输入盲盒ID"
              type="number"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
