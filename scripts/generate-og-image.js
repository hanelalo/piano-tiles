/**
 * 生成 OG 图片脚本
 * 需要先安装依赖: npm install canvas
 * 
 * 或者使用在线工具：
 * 1. 打开 public/og-image.svg
 * 2. 使用在线 SVG 转 PNG 工具：https://svgtopng.com/
 * 3. 设置为 1200x630px
 */

const fs = require('fs');
const path = require('path');

// 如果用户安装了 canvas 库，可以自动生成
// 这里提供一个简单的说明
console.log('OG 图片生成说明：');
console.log('1. SVG 文件已创建：public/og-image.svg');
console.log('2. 转换为 PNG (1200x630px) 的方法：');
console.log('   - 在线工具：https://svgtopng.com/');
console.log('   - 或使用：https://cloudconvert.com/svg-to-png');
console.log('   - 或使用 Chrome：打开 SVG 文件，右键 -> 检查 -> 截图');
console.log('3. 保存为：public/og-image.png');

