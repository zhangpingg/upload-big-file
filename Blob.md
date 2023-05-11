# Blob（浏览器端）
Blob是存储原始二进制数据 (存储任意值 | 如图片、音频、视频、文本等)
通过Blob构造函数创建 | 通过使用File对象 | 其他API中获取到的数据来创建
# size | type
size：数据的大小，即数据的字节数
type：该Blob对象所包含的 MIME 类型
text/plain 纯文本文档
text/htmlHTML 文档
text/javascriptJavaScript 文件
text/cssCSS 文件
application/jsonJSON 文件
application/pdfPDF 文件
application/xmlXML 文件
image/jpegJPEG 图像
image/pngPNG 图像
image/gifGIF 图像
image/svg+xmlSVG 图像
audio/mpegMP3 文件
video/mpegMP4 文件
# Blob.slice()
Blob.slice(start, end, contentType) 可以将blob对象分片,返回一个新的Blob对象
const [src, setSrc] = useState<string>();
useEffect(() => {
  const blob = new Blob(['abcde'], { type: 'text/plain' });
  const subBlob = blob.slice(0, 3);
  setSrc(URL.createObjectURL(subBlob));
}, []);
<iframe src={src} />    // iframe展示abc
