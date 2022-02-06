# 注: 文件夹 tessdata_fast-master 为识别图片中文字的语言包
![[Pasted image 20220205185027.png]]
# 1. tess4j依赖
```xml
<!--tess4j 依赖-->
<dependency>
    <groupId>net.sourceforge.tess4j</groupId>
    <artifactId>tess4j</artifactId>
    <version>4.1.1</version>
</dependency>
```

# 2. 封装工具类(示例)

```java
package com.heima.common.tess4j;

import lombok.Getter;
import lombok.Setter;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;

@Getter
@Setter
@Component
//读取yml配置
@ConfigurationProperties(prefix = "tess4j")
public class Tess4jClient {

	//读取yml配置
    private String dataPath;
    private String language;

    public String doOCR(BufferedImage image) throws TesseractException {
        //创建Tesseract对象
        ITesseract tesseract = new Tesseract();
        //设置字体库路径
        tesseract.setDatapath(dataPath);
        //中文识别
        tesseract.setLanguage(language);
        //执行ocr识别
        String result = tesseract.doOCR(image);
        //替换回车和tal键  使结果为一行
        result = result.replaceAll("\\r|\\n", "-").replaceAll(" ", "");
        return result;
    }

}

```

>在spring.factories配置中添加该类,完整如下：

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.heima.common.aliyun.GreenImageScan,\
  com.heima.common.tess4j.Tess4jClient
```

# 3. yml配置文件编写(示例)

```yml
tess4j:
  # 所在路劲
  data-path: D:\javadata\img-text\tessdata_fast-master
  # 选择语言包
  language: chi_sim
```

# 4. 使用代码(示例)
>直接注入 工具类使用即可

```java
	//直接注入 工具类使用即可
    @Autowired
    private Tess4jClient tess4jClient;
...
try {
    for (String image : images) {
        byte[] bytes = fileStorageService.downLoadFile(image);

        //图片识别文字审核---begin-----

        //从byte[]转换为butteredImage
        ByteArrayInputStream in = new ByteArrayInputStream(bytes);
        BufferedImage imageFile = ImageIO.read(in);
        //识别图片的文字
        String result = tess4jClient.doOCR(imageFile);

        //审核是否包含自管理的敏感词
        boolean isSensitive = handleSensitiveScan(result, wmNews);
        if(!isSensitive){
            return isSensitive;
        }

        //图片识别文字审核---end-----


        imageList.add(bytes);

    } 
}catch (Exception e){
    e.printStackTrace();
}

```




