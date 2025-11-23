// Google Analytics 事件跟踪工具

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * 发送 Google Analytics 事件
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * 游戏相关事件跟踪
 */
export const analytics = {
  // 游戏开始
  gameStart: (mode: string) => {
    trackEvent('game_start', 'Game', mode);
  },

  // 游戏完成（成功）
  gameComplete: (mode: string, score?: number, time?: number) => {
    trackEvent('game_complete', 'Game', mode, score || time);
    // 记录游戏完成的自定义事件
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'level_complete', {
        level_name: mode,
        score: score,
        time: time,
      });
    }
  },

  // 游戏失败
  gameFail: (mode: string, score?: number) => {
    trackEvent('game_fail', 'Game', mode, score);
  },

  // 游戏重试
  gameRetry: (mode: string) => {
    trackEvent('game_retry', 'Game', mode);
  },

  // 模式选择（从首页点击模式卡片）
  modeSelect: (mode: string) => {
    trackEvent('mode_select', 'Navigation', mode);
  },

  // 返回首页
  backToHome: (from: string) => {
    trackEvent('back_to_home', 'Navigation', from);
  },

  // 页面浏览
  pageView: (page: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-HM3XD8SQXN', {
        page_path: page,
      });
    }
  },

  // 新纪录
  newRecord: (mode: string, value: number) => {
    trackEvent('new_record', 'Achievement', mode, value);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'achievement_unlocked', {
        achievement_id: `record_${mode.toLowerCase()}`,
        achievement_name: `New ${mode} Record`,
        value: value,
      });
    }
  },
};

