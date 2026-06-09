package com.cinema.blindbox.service;

import com.cinema.blindbox.dto.ShareRequest;
import com.cinema.blindbox.entity.Share;
import com.cinema.blindbox.entity.ShareType;
import com.cinema.blindbox.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ShareService {

    @Autowired
    private ShareRepository shareRepository;

    @Autowired
    private BlindBoxService blindBoxService;

    public Map<String, Object> createShare(Long userId, ShareRequest request) {
        ShareType type;
        Long typeId;

        if (request.getType() != null && request.getTypeId() != null) {
            type = ShareType.valueOf(request.getType());
            typeId = request.getTypeId();
        } else if (request.getBlindBoxId() != null) {
            type = ShareType.BLINDBOX;
            typeId = request.getBlindBoxId();
        } else {
            throw new RuntimeException("缺少分享类型参数");
        }

        Share share = new Share();
        share.setUserId(userId);
        share.setType(type);
        share.setTypeId(typeId);
        share.setShareCode(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        Share saved = shareRepository.save(share);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("shareCode", saved.getShareCode());
        result.put("shareUrl", "/share/" + saved.getShareCode());
        result.put("blindBoxId", saved.getType() == ShareType.BLINDBOX ? saved.getTypeId() : null);
        result.put("type", saved.getType().name());
        result.put("typeId", saved.getTypeId());
        result.put("createdAt", saved.getCreatedAt());
        return result;
    }

    public List<Map<String, Object>> getMyShares(Long userId) {
        List<Share> shares = shareRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Share share : shares) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", share.getId());
            item.put("type", share.getType().name());
            item.put("typeId", share.getTypeId());
            item.put("shareCode", share.getShareCode());
            item.put("createdAt", share.getCreatedAt());
            result.add(item);
        }
        return result;
    }

    public Map<String, Object> getShareByShareCode(String shareCode) {
        Share share = shareRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new RuntimeException("分享不存在"));

        Map<String, Object> result = new HashMap<>();
        result.put("shareCode", share.getShareCode());
        result.put("type", share.getType().name());
        result.put("createdAt", share.getCreatedAt());

        if (share.getType() == ShareType.BLINDBOX) {
            Map<String, Object> blindBoxData = blindBoxService.getBlindBoxById(share.getTypeId());
            result.put("blindBox", blindBoxData);
        }

        return result;
    }

    public void deleteShare(Long userId, Long id) {
        Share share = shareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分享不存在"));

        if (!share.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此分享");
        }

        shareRepository.deleteById(id);
    }
}
