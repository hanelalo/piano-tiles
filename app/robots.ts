import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 不阻止任何页面的抓取，包括模式页面
      // 虽然模式页面不在 sitemap 中，但允许 Google 自然发现
    },
    sitemap: 'https://pianotilesgames.com/sitemap.xml',
  }
}

