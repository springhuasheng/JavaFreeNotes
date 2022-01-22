# 1. RocketMQ整体架构

![[Pasted image 20220122194433.png]]

# 1. 业务架构示例

![[Snipaste_2022-01-22_10-54-17.png]]

# 2. 依赖

## 2.1 原生依赖

```xml
<!--RocketMQ原生依赖-->  
<dependency>  
 	<groupId>org.apache.rocketmq</groupId>  
 	<artifactId>rocketmq-client</artifactId>  
 	<version>4.5.2</version>  
</dependency>
```

## 2.1 spring-boot整合依赖

```xml
<!--Springboot去整合RocketMQ-->  
<dependency>  
	 <groupId>org.apache.rocketmq</groupId>  
 	<artifactId>rocketmq-spring-boot-starter</artifactId>  
	 <version>2.0.3</version>  
</dependency>
```

## 2.2 spring-boot配置文件(示例, yml同)

### 2.2.1 消费者 

```properties
rocketmq.name-server=192.168.31.80:9876  
server.port=8081  
spring.datasource.url=jdbc:mysql:///javaweb  
spring.datasource.username=root  
spring.datasource.password=root spring.datasource.driver-class-name=com.mysql.jdbc.Driver
```

### 2.2.2 生产者

```properties
# RocketMQ服务器  
rocketmq.name-server=192.168.31.80:9876  
# 生产者组名称  
rocketmq.producer.group=abc
```


# 3. 代码示例(原生代码与spring-boot整合代码)

## 3.1 一对一 (OneToOne)

### 3.1.1 同步消息

#### 3.1.1.1 原生方法

##### 3.1.1.1.1 生产者

> 生产者: producer.start(); 启动服务 要写在 发送消息之前(后面则不再提示)

```java
package com.itheima.base;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
import java.util.Collection;  
  
public class Producer {  
    public static void main(String[] args) throws Exception {  
         // 创建一个发送消息的对象  new DefaultMQProducer("group1") 生产者组
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 Message msg = new Message("topic1", "hellomq".getBytes());  
		 SendResult sendResult = producer.send(msg);  
		 System.out.println("sendResult = " + sendResult);  
		 // 关闭连接  
		 producer.shutdown();  
 	}  
}
```

##### 3.1.1.1.2 消费者

> 消费者: producer.start(); 启动服务 要写在 接收消息之后, 有关闭连接要写在关闭连接之前(后面则不再提示)


```java
package com.itheima.base;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.List;  
  
public class Consumer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个收送消息的对象  
 		DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
 		// 连接到命名服务器  
		consumer.setNamesrvAddr("192.168.31.75:9876");  
 		// 设置订阅的topic    * 表示接收这个订阅下面的所有标签  
 		consumer.subscribe("topic1", "*");  
 		// 接收消息  
 		consumer.registerMessageListener(new MessageListenerConcurrently() {  
            @Override  
 			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 					}
				// 返回值表示是否接收成功 CONSUME_SUCCESS接收成功
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
			 }  
        });  
		 // 启动接收消息的服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
 	}  
}
```

#### 3.1.1.2 spring-boot整合

##### 3.1.1.2.1 生产者

```java
package com.itheima.producer.controller;  
  
import org.apache.rocketmq.spring.core.RocketMQTemplate;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.RestController;  
  
import java.util.Date;  
import java.util.HashMap;  
  
@RestController  
public class UserController {  
  
 @Autowired  
 RocketMQTemplate mqTemplate;  
  
 @GetMapping("login")  
    public String userLogin(String username, String password) {  
        if ("tom".equalsIgnoreCase(username) && "cat".equalsIgnoreCase(password)) {  
            HashMap<String, Object> map = new HashMap<>();  
			 map.put("userid", 1);  
			 map.put("ctype", 1); // 1 代表是登录  
			 map.put("ctime", new Date());  
			 // 发送消息  
			 // 第一个参数: topic  
			 // 第二个按时: 消息体 字节数据   
			//此方法也可以发送消息
			//mqTemplate.convertAndSend("userLogs",map); 
			// 同步消息 有返回值
			SendResult result = mqTemplate.syncSend("topic", map);
			return "登录成功";  
	 	  }  
		return "密码不对";  
	 }  
}
```

##### 3.1.1.2.2 消费者

```java
package com.itheima.consumer.mq;  
  
  
import com.itheima.consumer.domain.Logs;  
import com.itheima.consumer.mapper.LogsMapper;  
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;  
import org.apache.rocketmq.spring.core.RocketMQListener;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
  
@Component // ORDERLY为平均分配 CONCURRENTLY为广播  
//@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx",consumeMode = ConsumeMode.ORDERLY)
@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx")  
// 随便写一个类 实现 RocketMQListener 这个接口  
// 这个接口中的泛型就是我们的消息类型  
// 能够用哪个Bean去封装 JSON串  
public class MQConsumer implements RocketMQListener<Logs> {  
  
    @Autowired  
 	LogsMapper logsMapper;  
  
	 @Override  
	 public void onMessage(Logs logs) {  
			System.out.println("logs = " + logs);  
			// 消息的消费过程  
			logsMapper.addLogs(logs);  
 	}  
}

```

### 3.1.2 异步消息

#### 3.1.2.1 原生方法

##### 3.1.2.1.1 生产者

```java
package com.itheima.messagetype;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendCallback;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
import java.util.concurrent.TimeUnit;  
  
/* 测试消息类型 */
public class Producer {  
    public static void main(String[] args) throws Exception{  
         // 创建一个发送消息的对象  
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 for (int i = 1; i <= 10; i++) {  
            Message msg = new Message("topic1",("hellomq "+ i).getBytes());   
		 // 异步消息 发送消息成功后调用回调函数中的方法  
		 // 发送消息成功后调用 onSuccess
		 // 发送消息失败后调用 onException 
			producer.send(msg, new SendCallback(){  
                @Override  
				 public void onSuccess(SendResult sendResult) {  
					System.out.println("消息发送成功后回调");  
 				 }  
  
                @Override  
 				 public void onException(Throwable throwable) {  
                    System.out.println("消息发送失败后回调");  
 				 }  
            });  
			// 单向消息 发送消息后不会有返回值  
			producer.sendOneway(msg);  
 		}  
        TimeUnit.SECONDS.sleep(3);  
		 // 关闭连接  
		 producer.shutdown();  
	}  
}
```

##### 3.1.2.1.2 消费者

```java
package com.itheima.base;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.List;  
  
public class Consumer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个收送消息的对象  
 		DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
 		// 连接到命名服务器  
		consumer.setNamesrvAddr("192.168.31.75:9876");  
 		// 设置订阅的topic    * 表示接收这个订阅下面的所有标签  
 		consumer.subscribe("topic1", "*");  
 		// 接收消息  
 		consumer.registerMessageListener(new MessageListenerConcurrently() {  
            @Override  
 			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 					}
				// 返回值表示是否接收成功 CONSUME_SUCCESS接收成功
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
			 }  
        });  
		 // 启动接收消息的服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
 	}  
}
```

#### 3.1.2.2 spring-boot整合

##### 3.1.2.2.1 生产者

```java
package com.itheima.producer.controller;  
  
import org.apache.rocketmq.spring.core.RocketMQTemplate;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.RestController;  
  
import java.util.Date;  
import java.util.HashMap;  
  
@RestController  
public class UserController {  
  
 @Autowired  
 RocketMQTemplate mqTemplate;  
  
 @GetMapping("login")  
    public String userLogin(String username, String password) {  
        if ("tom".equalsIgnoreCase(username) && "cat".equalsIgnoreCase(password)) {  
            HashMap<String, Object> map = new HashMap<>();  
			 map.put("userid", 1);  
			 map.put("ctype", 1); // 1 代表是登录  
			 map.put("ctime", new Date());  
			 // 异步消息  
			mqTemplate.asyncSend("topic", map, new SendCallback() {  
				@Override  
			 	public void onSuccess(SendResult sendResult) {  
					System.out.println("发送消息成功");  
			 }  
				@Override  
			 	public void onException(Throwable throwable) {  
					System.out.println("发送消息失败");  
			 }  
			});
			return "登录成功";  
	 	  }  
		return "密码不对";  
	 }  
}
```

##### 3.1.2.2.2 消费者

```java
package com.itheima.consumer.mq;  
  
  
import com.itheima.consumer.domain.Logs;  
import com.itheima.consumer.mapper.LogsMapper;  
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;  
import org.apache.rocketmq.spring.core.RocketMQListener;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
  
@Component // ORDERLY为平均分配 CONCURRENTLY为广播  
//@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx",consumeMode = ConsumeMode.ORDERLY)
@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx")  
// 随便写一个类 实现 RocketMQListener 这个接口  
// 这个接口中的泛型就是我们的消息类型  
// 能够用哪个Bean去封装 JSON串  
public class MQConsumer implements RocketMQListener<Logs> {  
  
    @Autowired  
 	LogsMapper logsMapper;  
  
	 @Override  
	 public void onMessage(Logs logs) {  
			System.out.println("logs = " + logs);  
			// 消息的消费过程  
			logsMapper.addLogs(logs);  
 	}  
}
```

### 3.1.1 单向消息(用的地方不多)

#### 3.1.1.1 原生方法

##### 3.1.1.1.1 生产者

> 示例内容与上面方法一样, 只是发送的Api不一样, 并且没有返回值

```java
// 单向消息 发送消息后不会有返回值  
producer.sendOneway(msg);
```

##### 3.1.1.1.2 消费者

> 同上, 并且没有返回值

#### 3.1.1.2 spring-boot整合

##### 3.1.1.2.1 生产者

> 示例内容与上面方法一样, 只是发送的Api不一样, 并且没有返回值

```java
// 单向消息  
mqTemplate.sendOneWay("topic",map);
```

##### 3.1.1.2.2 消费者

> 同上, 并且没有返回值

## 3.2 一对多(One-To-Many)

### 3.2.1 原生方法

#### 3.2.1.1 生产者

```java
package com.itheima.one2many;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
public class Producer {  
    public static void main(String[] args) throws Exception{  
         // 创建一个发送消息的对象  
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 for (int i = 1; i <= 10; i++) {  
					Message msg = new Message("topic1",("hellomq "+ i).getBytes());  
		 SendResult sendResult = producer.send(msg);  
		 }  

				// 关闭连接  
		 producer.shutdown();  
		 }  
}
```

#### 3.2.1.2 消费者

注意此处的Api

>BROADCASTING广播模式 每个消费者都接收全部消息
>consumer.setMessageModel(MessageModel.BROADCASTING);

>默认是CLUSTERING 负载均衡模式
>consumer.setMessageModel(MessageModel.CLUSTERING);
>一个生产者发送10条, 一个消费组有两个消费者, 每个消费者分5条(轮询发送, 你一条我一条)


```java
package com.itheima.one2many;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;  
  
import java.util.List;  
  
/* 一个生产者对应多个消费者 */
public class Consumer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个收送消息的对象  
		 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
		 // 连接到命名服务器  
		 consumer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置订阅的topic  
		 consumer.subscribe("topic1","*");  
		 // 设置消费模式  
		 // 默认是CLUSTERING 负载均衡模式  
		 //consumer.setMessageModel(MessageModel.CLUSTERING);  
		 // BROADCASTING广播模式 每个消费者都接收全部消息  
		 consumer.setMessageModel(MessageModel.BROADCASTING);  
		 // 接收消息  
		 consumer.registerMessageListener(new MessageListenerConcurrently() {  
            @Override  
 			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 					}  
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
 				}  
        });  
		 // 启动服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
 }  
}
```

### 3.2.2 spring-boot整合

#### 3.2.2.1 生产者

>书写了 3种发送方式 使用到 仔细观看注释

```java
package com.itheima.producer.controller;  
  
import org.apache.rocketmq.spring.core.RocketMQTemplate;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.RestController;  
  
import java.util.Date;  
import java.util.HashMap;  
  
@RestController  
public class UserController {  
  
 @Autowired  
 RocketMQTemplate mqTemplate;  
  
 @GetMapping("login")  
    public String userLogin(String username, String password) {  
        if ("tom".equalsIgnoreCase(username) && "cat".equalsIgnoreCase(password)) {  
            HashMap<String, Object> map = new HashMap<>();  
			 map.put("userid", 1);  
			 map.put("ctype", 1); // 1 代表是登录  
			 map.put("ctime", new Date());  
			 // 发送消息  
			 // 第一个参数: topic  
			 // 第二个按时: 消息体 字节数据
			
			//此方法也可以发送消息
			//mqTemplate.convertAndSend("userLogs",map); 
			
			// 同步消息 有返回值
			SendResult result = mqTemplate.syncSend("topic", map);
			
			//单向消息 猜测 也可以
			//mqTemplate.sendOneWay("topic",map);
			return "登录成功";  
	 	  }  
		return "密码不对";  
	 }  
}

```

#### 3.2.2.2 消费者

>修改注解 即可


```java
package com.itheima.consumer.mq;  
  
  
import com.itheima.consumer.domain.Logs;  
import com.itheima.consumer.mapper.LogsMapper;  
import org.apache.rocketmq.spring.annotation.ConsumeMode;  
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;  
import org.apache.rocketmq.spring.core.RocketMQListener;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Component;  
  
@Component // ORDERLY为平均分配 CONCURRENTLY为广播  
@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx",consumeMode = ConsumeMode.ORDERLY)  
//@RocketMQMessageListener(topic = "userLogs",consumerGroup = "xxx")  
// 随便写一个类 实现 RocketMQListener 这个接口  
// 这个接口中的泛型就是我们的消息类型  
// 能够用哪个Bean去封装 JSON串  
public class MQConsumer implements RocketMQListener<Logs> {  
  
    @Autowired  
 	LogsMapper logsMapper;  
  
		 @Override  
		 public void onMessage(Logs logs) {  
			 System.out.println("logs = " + logs);  
			 // 消息的消费过程  
			 logsMapper.addLogs(logs);  
 		}  
}

```

## 3.3 多对多(Many-To-Many) 
>可参考前面代码书写, 个人觉得多对多使用局限, 有必要可以使用多个topic
>个人觉得使用不多, 并且Api相差不大, 如果用到提供参考

### 3.3.1 原生方法

#### 3.3.1.1 生产者

```java
package com.itheima.many2many;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
public class Producer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个发送消息的对象  
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 for (int i = 1; i <= 10; i++) {  
            Message msg = new Message("topic1",("hellomq "+ i).getBytes());  
 			SendResult sendResult = producer.send(msg);  
 			}  
  
        // 关闭连接  
 		producer.shutdown();  
 	}  
}

```

#### 3.3.1.2 消费者

```java
package com.itheima.many2many;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;  
  
import java.util.List;  
  
/* 多个生产者对应多个消费者 */public class Consumer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个收送消息的对象  
		 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
		 // 连接到命名服务器  
		 consumer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置订阅的topic  
		 consumer.subscribe("topic1","*");  
		 // 接收消息  
		 consumer.registerMessageListener(new MessageListenerConcurrently() {  
            @Override  
 			public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 				}  
                	return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
 				}  
        });  
		 // 启动服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
 }  
}

```

### 3.3.2 spring-boot整合(暂无)

>可参考前面代码书写, 个人觉得多对多使用局限, 有必要可以使用多个topic

## 3.4 延时消息

### 3.4.1 原生方法

#### 3.4.1.1 生产者

>此Api 只支持 设置的为 **等级** 是固定限制  
>在消费者里面设置时间

![[Pasted image 20220123004046.png]]


```java
package com.itheima.delaymessage;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
public class Producer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个发送消息的对象  
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 for (int i = 1; i <= 10; i++) {  
            Message msg = new Message("topic1",("hellomq "+ i).getBytes());  
			 // 1s 5s 10s 30s ....  
			 msg.setDelayTimeLevel(1);  
			 SendResult sendResult = producer.send(msg);  
		}  
  
			// 关闭连接  
			 producer.shutdown();  
 }  
}

```

#### 3.4.1.2 消费者

```java
package com.itheima.delaymessage;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;  
  
import java.util.List;  
  
/* 一个生产者对应多个消费者 */
	public class Consumer {  
    	public static void main(String[] args) throws Exception{  
        // 创建一个收送消息的对象  
		 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
		 // 连接到命名服务器  
		 consumer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置订阅的topic  
		 consumer.subscribe("topic1","*");  
		 // 接收消息  
		 consumer.registerMessageListener(new MessageListenerConcurrently() {  
					@Override  
		 public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 			}  
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
 		}  
        });  
		 // 启动服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
	}  
}

```


### 3.4.2 spring-boot整合


## 3.5 sql过滤
>sql过滤意思为, 消费者在接收消息时可以按照类似于sql语句的书写方式(编写条件)进行过滤出自己想要的消息
>在消息发送时, 可以设置消息的属性

### 3.5.1 原生方法

#### 3.5.1.1 生产者

```java
package com.itheima.filtersql;  
  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
  
public class Producer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个发送消息的对象  
		 DefaultMQProducer producer = new DefaultMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 启动服务  
		 producer.start();  
		 // 发送消息  
		 Message msg = new Message("topic1", ("hellomq..sql").getBytes());  
		 //设置消息的属性  
		 msg.putUserProperty("age","20");  
		 msg.putUserProperty("uname","zhshan");  
		 SendResult sendResult = producer.send(msg);  
		 // 关闭连接  
		 producer.shutdown();  
	}  
}

```

#### 3.5.1.2 消费者

```java
package com.itheima.filtersql;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.MessageSelector;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;  
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;  
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.List;  
  
/* 一个生产者对应多个消费者 */
public class Consumer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个收送消息的对象  
		 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
		 // 连接到命名服务器  
		 consumer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置订阅的topic  
		 consumer.subscribe("topic1", MessageSelector.bySql("uname = 'zhshan'"));  
		 // 接收消息  
		 consumer.registerMessageListener(new MessageListenerConcurrently() {  
					@Override  
		 public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
						for (MessageExt messageExt : list) {  
							System.out.println("接收消息 = " + new String(messageExt.getBody()));  
		 }  
						return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
		 }  
        });  
		 // 启动服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
		 }  
}
```

### 3.5.2 spring-boot整哈

## 3.6 顺序消费

>此案例提供思路, 满足以下两点即可达到, 顺序消费的目的


想要按顺序消费需要满足两个条件
- 连续的消息进入(按自己逻辑顺序进入)同一个队列
- 此队列, 消费的线程数只有一个


在生产者里设置连续消息进入同一个队列
```java
// 根据不同的消息选择不同的消息队列  
int i = order.getId().hashCode() % list.size();
```

在消费者设置, 一个线程来消费队列中的消息
```java
new MessageListenerOrderly()
```


### 3.6.1 原生方法

#### 3.6.1.1 生产者

```java

package com.itheima.order;  
  
import com.itheima.domain.Order;  
import org.apache.rocketmq.client.producer.DefaultMQProducer;  
import org.apache.rocketmq.client.producer.MessageQueueSelector;  
import org.apache.rocketmq.client.producer.SendResult;  
import org.apache.rocketmq.common.message.Message;  
import org.apache.rocketmq.common.message.MessageQueue;  
  
import java.util.ArrayList;  
import java.util.List;  
  
public class Producer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个发送消息的对象  
 DefaultMQProducer producer = new DefaultMQProducer("group1");  
 // 连接到命名服务器  
 producer.setNamesrvAddr("192.168.31.75:9876");  
 // 启动服务  
 producer.start();  
 // 准备数据  
 ArrayList<Order> orders = new ArrayList<>();  
 Order order1 = new Order();  
 order1.setId("a");  
 order1.setMsg("主单-1");  
 orders.add(order1);  
  
 Order order2 = new Order();  
 order2.setId("a");  
 order2.setMsg("子单-2");  
 orders.add(order2);  
  
 Order order3 = new Order();  
 order3.setId("a");  
 order3.setMsg("支付-3");  
 orders.add(order3);  
  
 Order order4 = new Order();  
 order4.setId("a");  
 order4.setMsg("推送-4");  
 orders.add(order4);  
  
 Order order5 = new Order();  
 order5.setId("b");  
 order5.setMsg("子单-1");  
 orders.add(order5);  
  
 Order order6 = new Order();  
 order6.setId("b");  
 order6.setMsg("子单-2");  
 orders.add(order6);  
  
 Order order7 = new Order();  
 order7.setId("c");  
 order7.setMsg("主单-1");  
 orders.add(order7);  
  
 Order order8 = new Order();  
 order8.setId("c");  
 order8.setMsg("子单-2");  
 orders.add(order8);  
  
 Order order9 = new Order();  
 order9.setId("c");  
 order9.setMsg("支付-3");  
 orders.add(order9);  
  
 // 将同一个订单业务信息发送到同一个队列中  
 for (Order order : orders) {  
            // 发送消息  
 Message msg = new Message("ordertopic", order.toString().getBytes());  
 SendResult send = producer.send(msg, new MessageQueueSelector() {  
                @Override  
 public MessageQueue select(List<MessageQueue> list, Message message, Object o) {  
                    // 根据不同的消息选择不同的消息队列  
 int i = order.getId().hashCode() % list.size();  
 return list.get(i);  
 }  
            }, null);  
 System.out.println("send = " + send);  
 }  
  
        // 关闭连接  
 producer.shutdown();  
 }  
}

```

#### 3.6.1.2 消费者

```java
package com.itheima.order;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.MessageSelector;  
import org.apache.rocketmq.client.consumer.listener.*;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.List;  
  
/* 一个生产者对应多个消费者 */public class Consumer {  
    public static void main(String[] args) throws Exception{  
        // 创建一个收送消息的对象  
 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
 // 连接到命名服务器  
 consumer.setNamesrvAddr("192.168.31.75:9876");  
 // 设置订阅的topic  
 consumer.subscribe("ordertopic","*");  
 // 同一个队列中使用同一个线程接收消息  
 consumer.registerMessageListener(new MessageListenerOrderly() {  
            @Override  
 public ConsumeOrderlyStatus consumeMessage(List<MessageExt> list, ConsumeOrderlyContext consumeOrderlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println(new String(messageExt.getBody()));  
 }  
                return ConsumeOrderlyStatus.SUCCESS;  
 }  
        });  
 // 启动服务  
 consumer.start();  
 // 关闭连接  
 //consumer.shutdown();  
 }  
}

```

### 3.6.2 spring-boot整合

## 3.7 事务消息

- 案例提供思路, 需要清楚的获取到监听的事务状态, 来决定后面的消息是否被消费
- 注意下面案例的监听事务里面的 checkLocalTransaction 消息回查 里面返回的状态码, 是对应着消息是否被消费的关键


### 3.7.1 原生方法

#### 3.7.1.1 生产者

```java
package com.itheima.transaction;  
  
import org.apache.rocketmq.client.exception.MQClientException;  
import org.apache.rocketmq.client.producer.*;  
import org.apache.rocketmq.common.message.Message;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.ArrayList;  
import java.util.concurrent.TimeUnit;  
  
public class Producer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个发送消息的对象  
		 TransactionMQProducer producer = new TransactionMQProducer("group1");  
		 // 连接到命名服务器  
		 producer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置监听事务状态  
		 producer.setTransactionListener(new MyTransactionListener());  
		 // 启动服务  
		 producer.start();  
		 // 构建消息  
		 Message msg = new Message("topic1", ("hellomq1...trans").getBytes());  
		 // 发送事务消息  
		 SendResult sendResult = producer.sendMessageInTransaction(msg, null);  
		 System.out.println("sendResult = " + sendResult);  
		 // 关闭连接  
		 //producer.shutdown();  
 }  
}

```

#### 3.7.1.2 监听的事务

```java
package com.itheima.transaction;  
  
import org.apache.rocketmq.client.producer.LocalTransactionState;  
import org.apache.rocketmq.client.producer.TransactionListener;  
import org.apache.rocketmq.common.message.Message;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.HashMap;  
  
public class MyTransactionListener implements TransactionListener {  
		// 保存本地的事务状态  
		 // Key为MQ中消息事务的ID Value定义本地事务的状态  
		 // 0: 代表正在执行/超时/未知 1: 代表事务成功 2: 代表事务异常/回滚  
 		private HashMap<String, Integer> lts = new HashMap<>();  
  
 		@Override  
		 public LocalTransactionState executeLocalTransaction(Message message, Object o) {  
        // 获取当期消息的事务ID  
		 String transactionId = message.getTransactionId();  
		 System.out.println("本次的事务ID是: " + transactionId);  
		 // 保存到本地事务状态中  
		 lts.put(transactionId, 0);  
		 try {  
					System.out.println("本地事务开始执行.....");  
		 Thread.sleep(30000);  
		 //System.out.println(1/0);  
		 System.out.println("本地事务执行成功.....");  
		 lts.put(transactionId, 1);  
		 } catch (Exception e) {  
					//e.printStackTrace();  
		 System.out.println("本地事务执行异常了....");  
		 lts.put(transactionId, 2);  
		 return LocalTransactionState.ROLLBACK_MESSAGE;  
		 }  
        return LocalTransactionState.COMMIT_MESSAGE;  
 }  
  
    @Override  
 public LocalTransactionState checkLocalTransaction(MessageExt messageExt) {  
        // 消息回查 MQ在一段时间内没有收到消息的确认 会来这里确认消息的状态  
		 // 我们可以根据本地事务的状态去给MQ发送确认消息  
		 // 获取消息的事务ID  
		 String transactionId = messageExt.getTransactionId();  
		 // 根据事务的ＩＤ获取本地事务的状态  
		 Integer status = lts.get(transactionId);  
		 // 输出事务状态到控制台  
		 System.out.println("事务ID:" +transactionId +"   " +"事务状态: " +status);  
		 switch (status) {  
		 case 0:  
				// 暂时不清楚情况 隔段时间再来询问  
		        return LocalTransactionState.UNKNOW;  
		 case 1:  
				// 成功  
		 		return LocalTransactionState.COMMIT_MESSAGE;  
		 case 2:  
				// 失败  
		 		return LocalTransactionState.ROLLBACK_MESSAGE;  
		 }  
				return LocalTransactionState.UNKNOW;  
		 }  
}

```

#### 3.7.1.3 消费者

```java

package com.itheima.transaction;  
  
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;  
import org.apache.rocketmq.client.consumer.listener.*;  
import org.apache.rocketmq.client.exception.MQClientException;  
import org.apache.rocketmq.common.consumer.ConsumeFromWhere;  
import org.apache.rocketmq.common.message.MessageExt;  
  
import java.util.List;  
import java.util.Random;  
import java.util.concurrent.TimeUnit;  
  
/* 一个生产者对应多个消费者 */
public class Consumer {  
    public static void main(String[] args) throws Exception {  
        // 创建一个收送消息的对象  
		 DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");  
		 // 连接到命名服务器  
		 consumer.setNamesrvAddr("192.168.31.75:9876");  
		 // 设置订阅的topic  
		 consumer.subscribe("topic1", "*");  
		 // 接收消息  
		 consumer.registerMessageListener(new MessageListenerConcurrently() {  
					@Override  
		 public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {  
                for (MessageExt messageExt : list) {  
                    System.out.println("接收消息 = " + new String(messageExt.getBody()));  
 		}  
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  
 		}  
        });  
		 // 启动服务  
		 consumer.start();  
		 // 关闭连接  
		 //consumer.shutdown();  
		 }  
}

```

### 3.7.2 spring-boot整合