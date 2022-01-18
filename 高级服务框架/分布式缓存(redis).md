# 0. 分布式缓存

基于Redis集群解决单机Redis存在的问题
单机的Redis存在四大问题：

![[Pasted image 20220118184650.png]]

# 1. Redis持久化

Redis有两种持久化方案：

-   RDB持久化
    
-   AOF持久化

## 1.1 RDB持久化

RDB全称Redis Database Backup file（Redis数据备份文件），也被叫做Redis数据快照。简单来说就是把内存中的所有数据都记录到磁盘中。当Redis实例故障重启后，从磁盘读取快照文件，恢复数据。快照文件称为RDB文件，默认是保存在当前运行目录

### 1.1.1 执行时机

RDB持久化在四种情况下会执行：

-   执行save命令
    
-   执行bgsave命令
    
-   Redis停机时
    
-   触发RDB条件时

#### 1.1.1.1 save命令

执行下面的命令，可以立即执行一次RDB：

![[Pasted image 20220118185414.png]]

- 由redis**主线程执行**RDB, 会**阻塞**所有命令

- save命令会导致主进程执行RDB，这个过程中其它所有命令都会被阻塞。只有在数据迁移时可能用到。

#### 1.1.1.2 bgsave命令

下面的命令可以异步执行RDB：

![[Pasted image 20220118185610.png]]

- **开启子进程**执行RDB, 避免主进程收到影响

- 这个命令执行后会开启独立进程完成RDB，主进程可以持续处理用户请求，不受影响。

#### 1.1.1.3 停机时

Redis停机时会执行一次save命令，实现RDB持久化。

1.1.1.4 触发RDB条件(可自主配置)

Redis内部有触发RDB的机制，可以在redis.conf文件中找到，格式如下：

```properties
# 900秒内，如果至少有1个key被修改，则执行bgsave ， 如果是save "" 则表示禁用RDB
save 900 1  
save 300 10  
save 60 10000 
```

RDB的其它配置也可以在redis.conf文件中设置：

```properties
# 是否压缩 ,建议不开启，压缩也会消耗cpu，磁盘的话不值钱
rdbcompression yes

# RDB文件名称
dbfilename dump.rdb  

# 文件保存的路径目录
dir ./ 
```

### 1.1.2 RDB原理

bgsave开始时会fork主进程得到子进程，子进程共享主进程的内存数据。完成fork后读取内存数据并写入 RDB 文件。

fork采用的是copy-on-write技术：

-   当主进程执行读操作时，访问共享内存；
    
-   当主进程执行写操作时，则会拷贝一份数据，执行写操作。


![[Pasted image 20220118191835.png]]

#### 1.1.2.1 RDB原理自我总结

**名词解释**:

页表: 是一个映射到内存区的一种手段, 操作页表也就是超控物理内存

1. bgsave开始时会fork主进程得到子进程, 此时别的请求是进不来的, 以免导致数据的不一致
2. 然后子进程开始对内存中的数据(read-only状态)进行读操作, 写到新的RDB文件(写完会替换旧Rdb文件)
3. 主进程有两个状态
- 读数据: 可以和子进程共享内存的数据(read-only状态)
- 写数据: 因为内存的数据为read-only状态, 不能进行写操作, 这时会拷贝出来内存的数据一份(所以在一瞬间会存在**内存溢出**, **会判断修改/新增/删除的key在第几页, 把这一页复制出来当做副本**), 主进程只会对这个副本进行写(修改)操作, 保证了子进程的无误差读取read-only状态的内容
4. 当子进程读取完read-only状态的数据, 现在存在了主线程写(修改)的副本数据与子进程读取的read-only状态的数据, 这俩数据会存在差异, 后面会进行一个相当于整合的操作

#### 1.1.2.2 RDB原理小结

RDB方式bgsave的基本流程？

-   fork主进程得到一个子进程，共享内存空间
    
-   子进程读取内存数据并写入新的RDB文件
    
-   用新RDB文件替换旧的RDB文件
    

RDB会在什么时候执行？save 60 1000代表什么含义？

-   默认是服务停止时
    
-   代表60秒内至少执行1000次修改则触发RDB
    

RDB的缺点？

-   RDB执行间隔时间长，两次RDB之间写入数据有丢失的风险
    
-   fork子进程、压缩、写出RDB文件都比较耗时

## 1.2 AOF持久化

### 1.2.1 AOF原理
AOF全称为Append Only File（追加文件）。Redis处理的每一个写命令都会记录在AOF文件，可以看做是命令日志文件。

![[Pasted image 20220118223457.png]]

### 1.2.2. AOF配置

AOF默认是关闭的，需要修改redis.conf配置文件来开启AOF：

```properties
# 是否开启AOF功能，默认是no
appendonly yes
# AOF文件的名称
appendfilename "appendonly.aof"
```

AOF的命令记录的频率也可以通过redis.conf文件来配：

```properties
# 表示每执行一次写命令，立即记录到AOF文件
appendfsync always 
# 写命令执行完先放入AOF缓冲区，然后表示每隔1秒将缓冲区数据写到AOF文件，是默认方案
appendfsync everysec 
# 写命令执行完先放入AOF缓冲区，由操作系统决定何时将缓冲区内容写回磁盘
appendfsync no
```

![[Pasted image 20220118223631.png]]

### 1.2.3 AOF文件重写
因为是记录命令，AOF文件会比RDB文件大的多。而且AOF会记录对同一个key的多次写操作，但只有最后一次写操作才有意义。通过执行bgrewriteaof命令，可以让AOF文件执行重写功能，用最少的命令达到相同效果。

![[Pasted image 20220118223743.png]]

如图，AOF原本有三个命令，但是`set num 123 和 set num 666`都是对num的操作，第二次会覆盖第一次的值，因此第一个命令记录下来没有意义。

所以重写命令后，AOF文件内容就是：`mset name jack num 666`

Redis也会在触发阈值时自动去重写AOF文件。阈值也可以在redis.conf中配置：
```properties
# AOF文件比上次文件 增长超过多少百分比则触发重写
auto-aof-rewrite-percentage 100
# AOF文件体积最小多大以上才触发重写 
auto-aof-rewrite-min-size 64mb 
```

## 1.3 RDB与AOF对比
RDB和AOF各有自己的优缺点，如果对数据安全性要求较高，在实际开发中往往会**结合**两者来使用。

![[Pasted image 20220118223849.png]]

# 2. Redis主从

## 2.1 主从数据同步原理

### 2.1.1 全量同步
主从第一次建立连接时，会执行**全量同步**，将master节点的所有数据都拷贝给slave节点，流程：

![[Pasted image 20220118224157.png]]

这里有一个问题，master如何得知salve是第一次来连接呢？？

有几个概念，可以作为判断依据：

-   **Replication Id**：简称replid，是数据集的标记，id一致则说明是同一数据集。每一个master都有唯一的replid，slave则会继承master节点的replid
    
-   **offset**：偏移量，随着记录在repl_baklog中的数据增多而逐渐增大。slave完成同步时也会记录当前同步的offset。如果slave的offset小于master的offset，说明slave数据落后于master，需要更新。
    

因此slave做数据同步，必须向master声明自己的replication id 和offset，master才可以判断到底需要同步哪些数据。

因为slave原本也是一个master，有自己的replid和offset，当第一次变成slave，与master建立连接时，发送的replid和offset是自己的replid和offset。

master判断发现slave发送来的replid与自己的不一致，说明这是一个全新的slave，就知道要做全量同步了。

master会将自己的replid和offset都发送给这个slave，slave保存这些信息。以后slave的replid就与master一致了。

因此，**master判断一个节点是否是第一次同步的依据，就是看replid是否一致**。

如图：

![[Pasted image 20220118224249.png]]

完整流程描述：

-   slave节点请求增量同步
    
-   master节点判断replid，发现不一致，拒绝增量同步
    
-   master将完整内存数据生成RDB，发送RDB到slave
    
-   slave清空本地数据，加载master的RDB
    
-   master将RDB期间的命令记录在repl_baklog，并持续将log中的命令发送给slave
    
-   slave执行接收到的命令，保持与master之间的同步

### 2.1.2 增量同步

全量同步需要先做RDB，然后将RDB文件通过网络传输个slave，成本太高了。因此除了第一次做全量同步，其它大多数时候slave与master都是做**增量同步**。

什么是增量同步？就是只更新slave与master存在差异的部分数据。如图：

![[Pasted image 20220118224408.png]]

那么master怎么知道slave与自己的数据差异在哪里呢?

### 2.1.3 repl_backlog原理

master怎么知道slave与自己的数据差异在哪里呢?

这就要说到全量同步时的repl_baklog文件了。

这个文件是一个固定大小的数组，只不过数组是环形，也就是说**角标到达数组末尾后，会再次从0开始读写**，这样数组头部的数据就会被覆盖。

repl_baklog中会记录Redis处理过的命令日志及offset，包括master当前的offset，和slave已经拷贝到的offset：

![[Pasted image 20220118224504.png]]

slave与master的offset之间的差异，就是salve需要增量拷贝的数据了。

随着不断有数据写入，master的offset逐渐变大，slave也不断的拷贝，追赶master的offset：

![[Pasted image 20220118224520.png]]

直到数组被填满：

![[Pasted image 20220118224542.png]]

此时，如果有新的数据写入，就会覆盖数组中的旧数据。不过，旧的数据只要是绿色的，说明是已经被同步到slave的数据，即便被覆盖了也没什么影响。因为未同步的仅仅是红色部分。

但是，如果slave出现网络阻塞，导致master的offset远远超过了slave的offset：

![[Pasted image 20220118224559.png]]

如果master继续写入新数据，其offset就会覆盖旧的数据，直到将slave现在的offset也覆盖：

![[Pasted image 20220118224616.png]]

棕色框中的红色部分，就是尚未同步，但是却已经被覆盖的数据。此时如果slave恢复，需要同步，却发现自己的offset都没有了，无法完成增量同步了。只能做全量同步。

#### 2.1.3.1 注! repl_backlog原理 

![[Pasted image 20220118224640.png]]

## 2.2 主从同步优化

主从同步可以保证主从数据的一致性，非常重要。

可以从以下几个方面来优化Redis主从就集群：

-   在master中配置repl-diskless-sync yes启用无磁盘复制，避免全量同步时的磁盘IO。
    
-   Redis单节点上的内存占用不要太大，减少RDB导致的过多磁盘IO
    
-   适当提高repl_baklog的大小，发现slave宕机时尽快实现故障恢复，尽可能避免全量同步
    
-   限制一个master上的slave节点数量，如果实在是太多slave，则可以采用主-从-从链式结构，减少master压力
    

主从从架构图：

![[Pasted image 20220118224943.png]]

## 2.3 小结

简述全量同步和增量同步区别？

-   全量同步：master将完整内存数据生成RDB，发送RDB到slave。后续命令则记录在repl_baklog，逐个发送给slave。
    
-   增量同步：slave提交自己的offset到master，master获取repl_baklog中从offset之后的命令给slave
    

什么时候执行全量同步？

-   slave节点第一次连接master节点时
    
-   slave节点断开时间太久，repl_baklog中的offset已经被覆盖时
    

什么时候执行增量同步？

-   slave节点断开又恢复，并且在repl_baklog中能找到offset时

# 3. Redis哨兵

Redis提供了哨兵（Sentinel）机制来实现主从集群的自动故障恢复。

## 3.1 哨兵原理

### 3.1.1 集群结构和作用

哨兵的结构如图：

![[Pasted image 20220118225144.png]]

哨兵的作用如下：

-   **监控**：Sentinel 会不断检查您的master和slave是否按预期工作
    
-   **自动故障恢复**：如果master故障，Sentinel会将一个slave提升为master。当故障实例恢复后也以新的master为主
    
-   **通知**：Sentinel充当Redis客户端的服务发现来源，当集群发生故障转移时，会将最新信息推送给Redis的客户端


### 3.1.2 集群监控原理

Sentinel基于心跳机制监测服务状态，每隔1秒向集群的每个实例发送ping命令：

•主观下线：如果某sentinel节点发现某实例未在规定时间响应，则认为该实例**主观下线**。

•客观下线：若超过指定数量（quorum）的sentinel都认为该实例主观下线，则该实例**客观下线**。quorum值最好超过Sentinel实例数量的一半。

![[Pasted image 20220118225241.png]]

### 3.1.3 集群故障恢复原理

一旦发现master故障，sentinel需要在salve中选择一个作为新的master，选择依据是这样的：

-   首先会判断slave节点与master节点断开时间长短，如果超过指定值（down-after-milliseconds * 10）则会排除该slave节点
    
-   然后判断slave节点的slave-priority值，越小优先级越高，如果是0则永不参与选举
    
-   如果slave-prority一样，则判断slave节点的offset值，越大说明数据越新，优先级越高
    
-   最后是判断slave节点的运行id大小，越小优先级越高。
    

当选出一个新的master后，该如何实现切换呢？

流程如下：

-   sentinel给备选的slave1节点发送slaveof no one命令，让该节点成为master
    
-   sentinel给所有其它slave发送slaveof 192.168.150.101 7002 命令，让这些slave成为新master的从节点，开始从新的master上同步数据。
    
-   最后，sentinel将故障节点标记为slave，当故障节点恢复后会自动成为新的master的slave节点

![[Pasted image 20220118225423.png]]

### 3.1.4 小结

Sentinel的三个作用是什么？

-   监控
    
-   故障转移
    
-   通知
    

Sentinel如何判断一个redis实例是否健康？

-   每隔1秒发送一次ping命令，如果超过一定时间没有相向则认为是主观下线
    
-   如果大多数sentinel都认为实例主观下线，则判定服务下线
    

故障转移步骤有哪些？

-   首先选定一个slave作为新的master，执行slaveof no one
    
-   然后让所有节点都执行slaveof 新master
    
-   修改故障节点配置，添加slaveof 新master

# 4. Redis分片集群

## 4.1.搭建分片集群

主从和哨兵可以解决高可用、高并发读的问题。但是依然有两个问题没有解决：

-   海量数据存储问题
    
-   高并发写的问题
    

使用分片集群可以解决上述问题，如图:

![[Pasted image 20220118225553.png]]

分片集群特征：

-   集群中有多个master，每个master保存不同数据
    
-   每个master都可以有多个slave节点
    
-   master之间通过ping监测彼此健康状态
    
-   客户端请求可以访问集群任意节点，最终都会被转发到正确节点

## 4.2 散列插槽

### 4.2.1.插槽原理

Redis会把每一个master节点映射到0~16383共16384个插槽（hash slot）上，查看集群信息时就能看到：

![[Pasted image 20220118225636.png]]

  
数据key不是与节点绑定，而是与插槽绑定。redis会根据key的有效部分计算插槽值，分两种情况：

-   key中包含"{}"，且“{}”中至少包含1个字符，“{}”中的部分是有效部分
    
-   key中不包含“{}”，整个key都是有效部分

例如：key是num，那么就根据num计算，如果是{itcast}num，则根据itcast计算。计算方式是利用CRC16算法得到一个hash值，然后对16384取余，得到的结果就是slot值。

![[Pasted image 20220118225653.png]]

如图，在7001这个节点执行set a 1时，对a做hash运算，对16384取余，得到的结果是15495，因此要存储到103节点。

到了7003后，执行`get num`时，对num做hash运算，对16384取余，得到的结果是2765，因此需要切换到7001节点

### 4.2.2.小结

Redis如何判断某个key应该在哪个实例？

-   将16384个插槽分配到不同的实例
    
-   根据key的有效部分计算哈希值，对16384取余
    
-   余数作为插槽，寻找插槽所在实例即可
    

如何将同一类数据固定的保存在同一个Redis实例？

-   这一类数据使用相同的有效部分，例如key都以{typeId}为前缀


# 5. 整和微服务

## 5.1 依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

## 5.2 配置Redis地址
```yml
spring:
  redis:
    cluster:
      nodes:
        - 192.168.150.101:7001
        - 192.168.150.101:7002
        - 192.168.150.101:7003
        - 192.168.150.101:8001
        - 192.168.150.101:8002
        - 192.168.150.101:8003
```

## 5.3 配置读写分离
在项目的启动类中，添加一个新的bean：

```java
@Bean
public LettuceClientConfigurationBuilderCustomizer clientConfigurationBuilderCustomizer(){
    return clientConfigurationBuilder -> clientConfigurationBuilder.readFrom(ReadFrom.REPLICA_PREFERRED);
}

```

这个bean中配置的就是读写策略，包括四种：

-   MASTER：从主节点读取
    
-   MASTER_PREFERRED：优先从master节点读取，master不可用才读取replica
    
-   REPLICA：从slave（replica）节点读取
    
-   REPLICA _PREFERRED：优先从slave（replica）节点读取，所有的slave都不可用才读取master