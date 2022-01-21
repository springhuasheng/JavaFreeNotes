# 服务器异步通信
  
消息队列在使用过程中，面临着很多实际问题需要思考：

![[Pasted image 20220121143206.png]]

# 1. 消息可靠性

消息从发送，到消费者接收，会经理多个过程：

![[Pasted image 20220121202230.png]]

其中的每一步都可能导致消息丢失，常见的丢失原因包括：

-   发送时丢失：
    
    -   生产者发送的消息未送达exchange
        
    -   消息到达exchange后未到达queue
        
-   MQ宕机，queue将消息丢失
    
-   consumer接收到消息后未消费就宕机
    

针对这些问题，RabbitMQ分别给出了解决方案：

-   生产者确认机制
    
-   mq持久化
    
-   消费者确认机制
    
-   失败重试机制

## 1.1 生产者消息确认

RabbitMQ提供了publisher confirm机制来避免消息发送到MQ过程中丢失。这种机制必须给每个消息指定一个唯一ID。消息发送到MQ以后，会返回一个结果给发送者，表示消息是否处理成功。

返回结果有两种方式：

-   publisher-confirm，发送者确认
    
    -   消息成功投递到交换机，返回ack
        
    -   消息未投递到交换机，返回nack
        
-   publisher-return，发送者回执
    
    -   消息投递到交换机了，但是没有路由到队列。返回ACK，及路由失败原因。

![[Pasted image 20220121202341.png]]

![[Pasted image 20220121202355.png]]

### 1.1.1 修改配置

首先，修改publisher服务中的application.yml文件，添加下面的内容：

```yml
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true
    template:
      mandatory: true
```

说明：

-   `publish-confirm-type`：开启publisher-confirm，这里支持两种类型：
    
    -   `simple`：同步等待confirm结果，直到超时
        
    -   `correlated`：异步回调，定义ConfirmCallback，MQ返回结果时会回调这个ConfirmCallback
        
-   `publish-returns`：开启publish-return功能，同样是基于callback机制，不过是定义ReturnCallback
    
-   `template.mandatory`：定义消息路由失败时的策略。true，则调用ReturnCallback；false：则直接丢弃消息

### 1.1.2 定义Return回调(交换机到队列)

每个RabbitTemplate只能配置一个ReturnCallback，因此需要在项目加载时配置：

修改publisher服务，添加一个：

```java
package cn.itcast.mq.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class CommonConfig implements ApplicationContextAware {
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        // 获取RabbitTemplate
        RabbitTemplate rabbitTemplate = applicationContext.getBean(RabbitTemplate.class);
        // 设置ReturnCallback
        rabbitTemplate.setReturnCallback((message, replyCode, replyText, exchange, routingKey) -> {
            // 投递失败，记录日志
            log.info("消息发送失败，应答码{}，原因{}，交换机{}，路由键{},消息{}",
                     replyCode, replyText, exchange, routingKey, message.toString());
            // 如果有业务需要，可以重发消息
        });
    }
}
```

### 1.1.3 定义ConfirmCallback(生产者到交换机)

ConfirmCallback可以在发送消息时指定，因为每个业务处理confirm成功或失败的逻辑不一定相同。

在publisher服务的cn.itcast.mq.spring.SpringAmqpTest类中，定义一个单元测试方法：

```java
public void testSendMessage2SimpleQueue() throws InterruptedException {
    // 1.消息体
    String message = "hello, spring amqp!";
    // 2.全局唯一的消息ID，需要封装到CorrelationData中
    CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
    // 3.添加callback
    correlationData.getFuture().addCallback(
        result -> {
            if(result.isAck()){
                // 3.1.ack，消息成功
                log.debug("消息发送成功, ID:{}", correlationData.getId());
            }else{
                // 3.2.nack，消息失败
                log.error("消息发送失败, ID:{}, 原因{}",correlationData.getId(), result.getReason());
            }
        },
        ex -> log.error("消息发送异常, ID:{}, 原因{}",correlationData.getId(),ex.getMessage())
    );
    // 4.发送消息
    rabbitTemplate.convertAndSend("task.direct", "task", message, correlationData);

    // 休眠一会儿，等待ack回执
    Thread.sleep(2000);
}
```


## 1.2 消息持久化

默认情况下，SpringAMQP发出的任何消息都是持久化的，不用特意指定, 交换机与队列也是一样。

## 1.3 消费者消息确认

RabbitMQ是**阅后即焚**机制，RabbitMQ确认消息被消费者消费后会立刻删除。

而RabbitMQ是通过消费者回执来确认消费者是否成功处理消息的：消费者获取消息后，应该向RabbitMQ发送ACK回执，表明自己已经处理消息。

设想这样的场景：

-   1）RabbitMQ投递消息给消费者
    
-   2）消费者获取消息后，返回ACK给RabbitMQ
    
-   3）RabbitMQ删除消息
    
-   4）消费者宕机，消息尚未处理
    

这样，消息就丢失了。因此消费者返回ACK的时机非常重要。

而SpringAMQP则允许配置三种确认模式：

•manual：手动ack，需要在业务代码结束后，调用api发送ack。

•auto：自动ack，由spring监测listener代码是否出现异常，没有异常则返回ack；抛出异常则返回nack

•none：关闭ack，MQ假定消费者获取消息后会成功处理，因此消息投递后立即被删除

由此可知：

-   none模式下，消息投递是不可靠的，可能丢失
    
-   auto模式类似事务机制，出现异常时返回nack，消息回滚到mq；没有异常，返回ack
    
-   manual：自己根据业务情况，判断什么时候该ack
    

一般，我们都是使用默认的auto即可。

### 1.3.1 配置auto模式

yml文件配置: 

```yml
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: auto # 自动
```

![[Pasted image 20220121203111.png]]

## 1.4 消费失败重试机制

当消费者出现异常后，消息会不断requeue（重入队）到队列，再重新发送给消费者，然后再次异常，再次requeue，无限循环，导致mq的消息处理飙升，带来不必要的压力：

![[Pasted image 20220121203136.png]]

### 1.4.1 本地重试

我们可以利用Spring的retry机制，在消费者出现异常时利用本地重试，而不是无限制的requeue到mq队列。

修改consumer服务的application.yml文件，添加内容：

```yml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true # 开启消费者失败重试
          initial-interval: 1000 # 初识的失败等待时长为1秒
          multiplier: 1 # 失败的等待时长倍数，下次等待时长 = multiplier * last-interval
          max-attempts: 3 # 最大重试次数
          stateless: true # true无状态；false有状态。如果业务中包含事务，这里改为false
```

重启consumer服务，重复之前的测试。可以发现：

-   在重试3次后，SpringAMQP会抛出异常AmqpRejectAndDontRequeueException，说明本地重试触发了
    
-   查看RabbitMQ控制台，发现消息被删除了，说明最后SpringAMQP返回的是ack，mq删除消息了
    

结论：

-   开启本地重试时，消息处理过程中抛出异常，不会requeue到队列，而是在消费者本地重试
    
-   重试达到最大次数后，Spring会返回ack，消息会被丢弃

### 1.4.2 失败策略

在之前的测试中，达到最大重试次数后，消息会被丢弃，这是由Spring内部机制决定的。

在开启重试模式后，重试次数耗尽，如果消息依然失败，则需要有MessageRecovery接口来处理，它包含三种不同的实现：

-   RejectAndDontRequeueRecoverer：重试耗尽后，直接reject，丢弃消息。默认就是这种方式
    
-   ImmediateRequeueMessageRecoverer：重试耗尽后，返回nack，消息重新入队
    
-   RepublishMessageRecoverer：重试耗尽后，将失败消息投递到指定的交换机
    

比较优雅的一种处理方案是RepublishMessageRecoverer，失败后将消息投递到一个指定的，专门存放异常消息的队列，后续由人工集中处理。

1）在consumer服务中定义处理失败消息的交换机和队列(也可注解声明)

```java
@Bean
public DirectExchange errorMessageExchange(){
    return new DirectExchange("error.direct");
}
@Bean
public Queue errorQueue(){
    return new Queue("error.queue", true);
}
@Bean
public Binding errorBinding(Queue errorQueue, DirectExchange errorMessageExchange){
    return BindingBuilder.bind(errorQueue).to(errorMessageExchange).with("error");
}
```

2）定义一个RepublishMessageRecoverer，关联队列和交换机

```java
@Bean
public MessageRecoverer republishMessageRecoverer(RabbitTemplate rabbitTemplate){
    return new RepublishMessageRecoverer(rabbitTemplate, "error.direct", "error");
}
```

## 1.5 总结

如何确保RabbitMQ消息的可靠性？

-   开启生产者确认机制，确保生产者的消息能到达队列
    
-   开启持久化功能，确保消息未消费前在队列中不会丢失
    
-   开启消费者确认机制为auto，由spring确认消息处理成功后完成ack
    
-   开启消费者失败重试机制，并设置MessageRecoverer，多次重试失败后将消息投递到异常交换机，交由人工处理

## 2.1 初识死信交换机

### 2.1.1 什么是死信交换机

什么是死信？

当一个队列中的消息满足下列情况之一时，可以成为死信（dead letter）：

-   消费者使用basic.reject或 basic.nack声明消费失败，并且消息的requeue参数设置为false
    
-   消息是一个过期消息，超时无人消费
    
-   要投递的队列消息满了，无法投递

如果这个包含死信的队列配置了`dead-letter-exchange`属性，指定了一个交换机，那么队列中的死信就会投递到这个交换机中，而这个交换机称为**死信交换机**（Dead Letter Exchange，检查DLX）。

![[Pasted image 20220121204651.png]]

另外，队列将死信投递给死信交换机时，必须知道两个信息：

-   死信交换机名称
    
-   死信交换机与死信队列绑定的RoutingKey

这样才能确保投递的消息能到达死信交换机，并且正确的路由到死信队列。

![[Pasted image 20220121204705.png]]













