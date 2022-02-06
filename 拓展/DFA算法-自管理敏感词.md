![[Pasted image 20220205190839.png]]

# 1. DFA实现原理

DFA全称为：Deterministic Finite Automaton,即确定有穷自动机。

存储：一次性的把所有的敏感词存储到了多个map中，就是下图表示这种结构

敏感词：冰毒、大麻、大坏蛋

![[Pasted image 20220205190910.png]]

![[Pasted image 20220205190918.png]]

# 2. 使用示例

## 2.1 创建敏感词表
![[Pasted image 20220205191030.png]]

## 2.2 实体类映射
```java
package com.heima.model.wemedia.pojos;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * <p>
 * 敏感词信息表
 * </p>
 *
 * @author itheima
 */
@Data
@TableName("wm_sensitive")
public class WmSensitive implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 敏感词
     */
    @TableField("sensitives")
    private String sensitives;

    /**
     * 创建时间
     */
    @TableField("created_time")
    private Date createdTime;

}
```

## 2.3 封装工具类
>可直接使用, 注意注释的解释

```java
package com.heima.utils.common;  
  
  
import java.util.*;  
  
public class SensitiveWordUtil {  
  
    public static Map<String, Object> dictionaryMap = new HashMap<>();  
  
  
 /**  
 * 生成关键词字典库  
 * @param words  
 * @return  
 */  
 public static void initMap(Collection<String> words) {  
        if (words == null) {  
            System.out.println("敏感词列表不能为空");  
 return ; }  
  
        // map初始长度words.size()，整个字典库的入口字数(小于words.size()，因为不同的词可能会有相同的首字)  
 Map<String, Object> map = new HashMap<>(words.size());  
 // 遍历过程中当前层次的数据  
 Map<String, Object> curMap = null;  
 Iterator<String> iterator = words.iterator();  
  
 while (iterator.hasNext()) {  
            String word = iterator.next();  
 curMap = map;  
 int len = word.length();  
 for (int i =0; i < len; i++) {  
                // 遍历每个词的字  
 String key = String.valueOf(word.charAt(i));  
 // 当前字在当前层是否存在, 不存在则新建, 当前层数据指向下一个节点, 继续判断是否存在数据  
 Map<String, Object> wordMap = (Map<String, Object>) curMap.get(key);  
 if (wordMap == null) {  
                    // 每个节点存在两个数据: 下一个节点和isEnd(是否结束标志)  
 wordMap = new HashMap<>(2);  
 wordMap.put("isEnd", "0");  
 curMap.put(key, wordMap);  
 }  
                curMap = wordMap;  
 // 如果当前字是词的最后一个字，则将isEnd标志置1  
 if (i == len -1) {  
                    curMap.put("isEnd", "1");  
 }  
            }  
        }  
  
        dictionaryMap = map;  
 }  
  
    /**  
 * 搜索文本中某个文字是否匹配关键词  
 * @param text  
 * @param beginIndex  
 * @return  
 */  
 private static int checkWord(String text, int beginIndex) {  
        if (dictionaryMap == null) {  
            throw new RuntimeException("字典不能为空");  
 }  
        boolean isEnd = false;  
 int wordLength = 0;  
 Map<String, Object> curMap = dictionaryMap;  
 int len = text.length();  
 // 从文本的第beginIndex开始匹配  
 for (int i = beginIndex; i < len; i++) {  
            String key = String.valueOf(text.charAt(i));  
 // 获取当前key的下一个节点  
 curMap = (Map<String, Object>) curMap.get(key);  
 if (curMap == null) {  
                break;  
 } else {  
                wordLength ++;  
 if ("1".equals(curMap.get("isEnd"))) {  
                    isEnd = true;  
 }  
            }  
        }  
        if (!isEnd) {  
            wordLength = 0;  
 }  
        return wordLength;  
 }  
  
    /**  
 * 获取匹配的关键词和命中次数  
 * @param text  
 * @return  
 */  
 public static Map<String, Integer> matchWords(String text) {  
        Map<String, Integer> wordMap = new HashMap<>();  
 int len = text.length();  
 for (int i = 0; i < len; i++) {  
            int wordLength = checkWord(text, i);  
 if (wordLength > 0) {  
                String word = text.substring(i, i + wordLength);  
 // 添加关键词匹配次数  
 if (wordMap.containsKey(word)) {  
                    wordMap.put(word, wordMap.get(word) + 1);  
 } else {  
                    wordMap.put(word, 1);  
 }  
  
                i += wordLength - 1;  
 }  
        }  
        return wordMap;  
 }  
  
    /**  
 * 使用示例  
 */  
 public static void main(String[] args) {  
        //创建敏感的 关键词语 或 字  
 List<String> list = new ArrayList<>();  
 list.add("法轮");  
 list.add("法轮功");  
 list.add("冰毒");  
 //生成关键词字典库  
 initMap(list);  
 //模拟一条存在敏感词的语句  
 String content="我是一个好人，并不会卖冰毒，也不操练法轮功,我真的不卖冰毒";  
 //获取匹配的关键词和命中次数  
 Map<String, Integer> map = matchWords(content);  
 //输出示例  
 System.out.println(map);  
 }  
}
```

## 2.4 使用示例
```java
//查询数据库表 获取所有的敏感词  
List<WmSensitive> wmSensitives = wmSensitiveMapper  
 .selectList(Wrappers.<WmSensitive>lambdaQuery()  
                .select(WmSensitive::getSensitives));  
//并提取敏感词的字段  
List<String> sensitiveList = wmSensitives  
        .stream()  
        .map(WmSensitive::getSensitives)  
        .collect(Collectors.toList());  
//先初始化敏感词库  
SensitiveWordUtil.initMap(sensitiveList);  
  
//查看文章中是否包含敏感词  
//content为您想查询的文字 eg: 我是好人, 并不会卖冰毒  
Map<String, Integer> map = SensitiveWordUtil.matchWords(content);  
//已经检测出敏感部分 就可以任意操作
```
