import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pianotilesgames.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // 注意：模式页面（/mode/classic, /mode/arcade 等）不包含在 sitemap 中
    // 原因：这些页面主要是游戏界面，没有 SEO 价值
    // 但允许 Google 通过其他方式（如外链）自然发现这些页面
  ]
}

